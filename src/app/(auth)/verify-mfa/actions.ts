'use server'

import { redirect } from 'next/navigation'
import { challengeMFA, verifyMFA } from '@/lib/supabase/auth'

export async function verifyMFAAction(formData: FormData): Promise<never> {
  const factorId = formData.get('factorId') as string
  const code = formData.get('code') as string
  const redirectTo = (formData.get('redirectTo') as string) || '/dashboard'

  const challenge = await challengeMFA(factorId)
  if (challenge.error) {
    redirect(
      `/verify-mfa?factorId=${factorId}&error=${encodeURIComponent('Error al iniciar desafío MFA. Intente de nuevo.')}`,
    )
  }

  const verified = await verifyMFA(factorId, challenge.data.challengeId, code)
  if (verified.error) {
    redirect(
      `/verify-mfa?factorId=${factorId}&error=${encodeURIComponent('Código incorrecto. Verifique su aplicación autenticadora.')}`,
    )
  }

  // Sesión elevada a AAL2 — acceso completo a datos clínicos
  redirect(redirectTo)
}
