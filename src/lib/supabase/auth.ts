import { createClient } from '@/lib/supabase/server'
import type { AuthError, User } from '@supabase/supabase-js'

export type AuthResult<T = void> =
  | { data: T; error: null }
  | { data: null; error: AuthError | Error }

// ---- Core Auth ----

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthResult<{ requiresMfa: boolean; factorId?: string }>> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { data: null, error }

  const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
  if (factorsError) return { data: null, error: factorsError }

  const totp = factors?.totp ?? []
  if (totp.length > 0) {
    return { data: { requiresMfa: true, factorId: totp[0].id }, error: null }
  }

  return { data: { requiresMfa: false }, error: null }
}

export async function signOut(): Promise<AuthResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) return { data: null, error }
  return { data: undefined, error: null }
}

export async function getUser(): Promise<AuthResult<User>> {
  const supabase = await createClient()
  // getUser() revalida contra el servidor — más seguro que getSession() para SSR
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return { data: null, error: error ?? new Error('Sin sesión activa') }
  return { data: data.user, error: null }
}

export async function getSession(): Promise<AuthResult<{ user: User; mfaLevel: 'aal1' | 'aal2' }>> {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    return { data: null, error: userError ?? new Error('Sin sesión activa') }
  }

  const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aalError) return { data: null, error: aalError }

  return {
    data: {
      user: userData.user,
      mfaLevel: (aalData?.currentLevel ?? 'aal1') as 'aal1' | 'aal2',
    },
    error: null,
  }
}

// ---- MFA Enrollment ----

export async function enrollMFA(): Promise<
  AuthResult<{ factorId: string; qrCode: string; secret: string }>
> {
  const supabase = await createClient()

  // Limpiar factores sin verificar antes de inscribir uno nuevo,
  // para que reintentos del usuario no queden bloqueados.
  const { data: existingFactors } = await supabase.auth.mfa.listFactors()
  const unverified = existingFactors?.totp?.filter((f) => f.status === 'unverified') ?? []
  for (const factor of unverified) {
    await supabase.auth.mfa.unenroll({ factorId: factor.id })
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: 'Autenticador Médico',
  })

  if (error || !data) return { data: null, error: error ?? new Error('Error al iniciar inscripción MFA') }

  return {
    data: {
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    },
    error: null,
  }
}

export async function verifyMFAEnrollment(
  factorId: string,
  code: string,
): Promise<AuthResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code })
  if (error) return { data: null, error }
  return { data: undefined, error: null }
}

// ---- MFA Challenge / Verify (flujo de inicio de sesión) ----

export async function challengeMFA(
  factorId: string,
): Promise<AuthResult<{ challengeId: string }>> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.mfa.challenge({ factorId })
  if (error || !data) return { data: null, error: error ?? new Error('Error al crear desafío MFA') }
  return { data: { challengeId: data.id }, error: null }
}

export async function verifyMFA(
  factorId: string,
  challengeId: string,
  code: string,
): Promise<AuthResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code })
  if (error) return { data: null, error }
  return { data: undefined, error: null }
}
