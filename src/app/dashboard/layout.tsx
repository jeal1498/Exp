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
      <header className={styles.header}>
        <div className={styles.nav}>
          <span className={styles.wordmark}>Expedientes Clínicos · Neuropsicología</span>
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
      <main className={styles.main}>{children}</main>
    </div>
  )
}
