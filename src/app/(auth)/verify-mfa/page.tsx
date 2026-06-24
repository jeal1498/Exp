import { redirect } from 'next/navigation'
import { verifyMFAAction } from './actions'

export const metadata = { title: 'Verificación MFA — Expedientes Clínicos' }

export default async function VerifyMFAPage({
  searchParams,
}: {
  searchParams: Promise<{ factorId?: string; redirect?: string; error?: string }>
}) {
  const params = await searchParams

  if (!params.factorId) {
    redirect('/login')
  }

  return (
    <main>
      <h1>Verificación de Identidad</h1>
      <p>Ingresa el código de 6 dígitos de tu aplicación autenticadora.</p>
      <form action={verifyMFAAction}>
        <input type="hidden" name="factorId" value={params.factorId} />
        <input type="hidden" name="redirectTo" value={params.redirect ?? '/dashboard'} />
        <label>
          Código de autenticación
          <input
            type="text"
            name="code"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            autoComplete="one-time-code"
            autoFocus
            required
          />
        </label>
        {params.error && (
          <p role="alert" aria-live="assertive">
            {decodeURIComponent(params.error)}
          </p>
        )}
        <button type="submit">Verificar</button>
      </form>
      <a href="/login">Volver al inicio de sesión</a>
    </main>
  )
}
