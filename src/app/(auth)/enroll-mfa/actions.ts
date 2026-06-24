'use server'

import { redirect } from 'next/navigation'
import { enrollMFA, verifyMFAEnrollment } from '@/lib/supabase/auth'

export async function enrollMFAAction(): Promise<never> {
  const result = await enrollMFA()

  if (result.error) {
    redirect(
      `/enroll-mfa?error=${encodeURIComponent('Error al iniciar inscripción MFA. Intente de nuevo.')}`,
    )
  }

  const { factorId, qrCode } = result.data
  redirect(
    `/enroll-mfa?step=verify&factorId=${factorId}&qrCode=${encodeURIComponent(qrCode)}`,
  )
}

export async function verifyEnrollmentAction(formData: FormData): Promise<never> {
  const factorId = formData.get('factorId') as string
  const code = formData.get('code') as string

  const result = await verifyMFAEnrollment(factorId, code)

  if (result.error) {
    redirect(
      `/enroll-mfa?step=verify&factorId=${factorId}&qrCode=${formData.get('qrCode') ?? ''}&error=${encodeURIComponent('Código incorrecto. Intente de nuevo.')}`,
    )
  }

  redirect('/dashboard')
}
