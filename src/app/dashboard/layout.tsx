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
            Expedientes Clínicos · Neuropsicología
          </a>
          <NavLinks />
          <div className={styles.navMeta}>
            <span className={styles.userEmail}>{email}</span>
            <form action={signOutAction}>
              <button type="submit" className={styles.signOut}>
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>
      <main id="main-content" className={styles.main}>{children}</main>
    </div>
  )
}
