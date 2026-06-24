import { signOutAction } from './actions'
import { getUser } from '@/lib/supabase/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard — Expedientes Clínicos' }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getUser()
  const email = session.data?.email ?? ''

  return (
    <div>
      <header>
        <nav>
          <strong>Expedientes Clínicos · Neuropsicología</strong>
          <span> | </span>
          <a href="/dashboard">Inicio</a>
          <span> · </span>
          <a href="/dashboard/pacientes">Pacientes</a>
          <span> · </span>
          <span style={{ fontSize: '0.85em', color: '#555' }}>{email}</span>
          <span> · </span>
          <form action={signOutAction} style={{ display: 'inline' }}>
            <button type="submit" style={{ cursor: 'pointer' }}>
              Cerrar sesión
            </button>
          </form>
        </nav>
        <hr />
      </header>
      <main>{children}</main>
    </div>
  )
}
