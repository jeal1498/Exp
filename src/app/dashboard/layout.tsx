import { signOutAction } from './actions'
import { getUser } from '@/lib/supabase/auth'
import { NavLinks } from './NavLinks'
import styles from './layout.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard — Expedientes Clínicos' }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getUser()
  const email = session.data?.email ?? ''

  return (
    <div className={styles.shell}>
      <a href="#main-content" className={styles.skipLink}>
        Saltar al contenido principal
      </a>
      <header className={styles.header}>
        <div className={styles.nav}>
          <a href="/dashboard" className={styles.wordmark}>
            Expedientes Clínicos
          </a>
          <div className={styles.navMeta}>
            <form action={signOutAction}>
              <button type="submit" className={styles.signOut}>
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main id="main-content" className={styles.main}>{children}</main>
      <nav className={styles.bottomNav} aria-label="Navegación principal">
        <NavLinks />
      </nav>
    </div>
  )
}
