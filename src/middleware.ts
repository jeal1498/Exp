import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

  if (aalData?.currentLevel !== 'aal2') {
    const { data: factors } = await supabase.auth.mfa.listFactors()
    const totpFactors = factors?.totp ?? []

    if (totpFactors.length > 0) {
      const mfaUrl = new URL('/verify-mfa', request.url)
      mfaUrl.searchParams.set('factorId', totpFactors[0].id)
      mfaUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(mfaUrl)
    }

    return NextResponse.redirect(new URL('/enroll-mfa', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
