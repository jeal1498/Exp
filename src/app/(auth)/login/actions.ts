'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { signInWithPassword } from '@/lib/supabase/auth'
import { sendLoginAlertEmail } from '@/lib/resend'

export async function signIn(formData: FormData): Promise<never> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirectTo') as string) || '/dashboard'

  const result = await signInWithPassword(email, password)

  if (result.error) {
    redirect(`/login?error=${encodeURIComponent('Credenciales incorrectas. Intente de nuevo.')}`)
  }

  const h = await headers()
  await sendLoginAlertEmail({
    to: email,
    userAgent: h.get('user-agent') ?? 'desconocido',
    timestamp: new Date().toISOString(),
  })

  // MFA desactivado temporalmente — redirigir directamente al dashboard
  redirect(redirectTo)
}
