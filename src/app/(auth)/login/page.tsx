import type { Metadata } from 'next'
import { signIn } from './actions'
import { SubmitButton } from '@/components/ui/SubmitButton'
import styles from './login.module.css'

export const metadata: Metadata = {
  title: 'Acceso al Sistema — Expedientes Clínicos',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>
}) {
  const params = await searchParams
  const error = params.error ? decodeURIComponent(params.error) : null

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.container}>

          {/* Wordmark */}
          <header className={styles.header}>
            <span className={styles.wordmark}>Expedientes Clínicos</span>
            <span className={styles.subtitle}>Neuropsicología · Consulta Privada</span>
          </header>

          {/* Form */}
          <form action={signIn} className={styles.form}>
            <input
              type="hidden"
              name="redirectTo"
              value={params.redirect ?? '/dashboard'}
            />

            {/* Error banner */}
            {error && (
              <div
                role="alert"
                aria-atomic="true"
                className={styles.errorBanner}
              >
                <svg
                  className={styles.errorIcon}
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="7.5"
                    cy="7.5"
                    r="6.25"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M5 5L10 10M10 5L5 10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                name="email"
                className={styles.input}
                autoComplete="email"
                autoFocus
                required
                spellCheck={false}
                autoCapitalize="none"
              />
            </div>

            {/* Password */}
            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                name="password"
                className={styles.input}
                autoComplete="current-password"
                required
              />
            </div>

            <SubmitButton className={styles.submit}>
              Iniciar sesión
            </SubmitButton>
          </form>

        </div>
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Acceso restringido — expedientes clínicos con datos sensibles
          {' · '}
          NOM&#x2011;004 / NOM&#x2011;024
        </p>
      </footer>
    </div>
  )
}
