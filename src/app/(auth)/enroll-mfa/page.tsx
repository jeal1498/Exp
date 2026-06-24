import { enrollMFAAction, verifyEnrollmentAction } from './actions'

export const metadata = { title: 'Configurar Autenticación — Expedientes Clínicos' }

export default async function EnrollMFAPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; factorId?: string; qrCode?: string; error?: string }>
}) {
  const params = await searchParams

  if (params.step === 'verify' && params.factorId && params.qrCode) {
    const qrCode = decodeURIComponent(params.qrCode)

    return (
      <main>
        <h1>Configurar Autenticador</h1>
        <p>Escanea el código QR con tu aplicación autenticadora (Google Authenticator, Authy, etc.).</p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrCode} alt="Código QR para autenticador TOTP" width={200} height={200} />

        <form action={verifyEnrollmentAction}>
          <input type="hidden" name="factorId" value={params.factorId} />
          <input type="hidden" name="qrCode" value={params.qrCode} />
          <label>
            Código de verificación (6 dígitos)
            <br />
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
            <p role="alert" style={{ color: 'red' }}>
              {decodeURIComponent(params.error)}
            </p>
          )}
          <br />
          <button type="submit">Confirmar inscripción</button>
        </form>
      </main>
    )
  }

  return (
    <main>
      <h1>Autenticación Multifactor Requerida</h1>
      <p>
        Este sistema clínico requiere autenticación de dos factores (MFA) conforme a la
        NOM-024-SSA3-2012. Debes configurar una aplicación autenticadora antes de continuar.
      </p>
      {params.error && (
        <p role="alert" style={{ color: 'red' }}>
          {decodeURIComponent(params.error)}
        </p>
      )}
      <form action={enrollMFAAction}>
        <button type="submit">Iniciar configuración MFA</button>
      </form>
    </main>
  )
}
