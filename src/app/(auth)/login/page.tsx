import { signIn } from './actions'

export const metadata = { title: 'Iniciar sesión — Expedientes Clínicos' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>
}) {
  const params = await searchParams

  return (
    <main>
      <h1>Acceso al Sistema</h1>
      <form action={signIn}>
        <input type="hidden" name="redirectTo" value={params.redirect ?? '/dashboard'} />
        <label>
          Correo electrónico
          <input type="email" name="email" autoComplete="email" required />
        </label>
        <label>
          Contraseña
          <input type="password" name="password" autoComplete="current-password" required />
        </label>
        {params.error && (
          <p role="alert" aria-live="assertive">
            {decodeURIComponent(params.error)}
          </p>
        )}
        <button type="submit">Iniciar sesión</button>
      </form>
    </main>
  )
}
