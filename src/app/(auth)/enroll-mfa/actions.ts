'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { enrollMFA, verifyMFAEnrollment } from '@/lib/supabase/auth'

export async function enrollMFAAction(): Promise<never> {
  try {
    const result = await enrollMFA()

    if (result.error) {
      console.error('[MFA] enroll error:', result.error.message)
      redirect(
        `/enroll-mfa?error=${encodeURIComponent(result.error.message || 'Error al iniciar inscripción MFA. Intente de nuevo.')}`,
      )
    }

    const { factorId, qrCode, secret } = result.data
    const cookieStore = cookies()
    cookieStore.set('mfa_enrollment', JSON.stringify({ factorId, qrCode, secret }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })

    redirect('/enroll-mfa?step=verify')
  } catch (err) {
    // Re-lanzar NEXT_REDIRECT para que Next.js procese el redirect
    if ((err as { digest?: string })?.digest?.startsWith?.('NEXT_REDIRECT')) throw err
    console.error('[MFA] enrollMFAAction unexpected error:', err)
    redirect(
      `/enroll-mfa?error=${encodeURIComponent('Error al iniciar inscripción MFA. Intente de nuevo.')}`,
    )
  }
}

export async function verifyEnrollmentAction(formData: FormData): Promise<never> {
  try {
    const cookieStore = cookies()
    const enrollment = cookieStore.get('mfa_enrollment')

    if (!enrollment) {
      redirect(
        `/enroll-mfa?error=${encodeURIComponent('Sesión de inscripción expirada. Inicie de nuevo.')}`,
      )
    }

    const { factorId } = JSON.parse(enrollment.value) as { factorId: string }
    const code = formData.get('code') as string

    const result = await verifyMFAEnrollment(factorId, code)

    if (result.error) {
      redirect(
        `/enroll-mfa?step=verify&error=${encodeURIComponent('Código incorrecto. Intente de nuevo.')}`,
      )
    }

    cookieStore.delete('mfa_enrollment')
    redirect('/dashboard')
  } catch (err) {
    if ((err as { digest?: string })?.digest?.startsWith?.('NEXT_REDIRECT')) throw err
    console.error('[MFA] verifyEnrollmentAction unexpected error:', err)
    redirect(
      `/enroll-mfa?step=verify&error=${encodeURIComponent('Error al verificar código. Intente de nuevo.')}`,
    )
  }
}
