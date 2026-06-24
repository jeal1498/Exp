import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { count } = await supabase
    .from('pacientes')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)

  return (
    <div>
      <h1>Panel Principal</h1>
      <p>
        Pacientes activos: <strong>{count ?? 0}</strong>
      </p>
      <ul>
        <li>
          <a href="/dashboard/pacientes">Ver todos los pacientes</a>
        </li>
        <li>
          <a href="/dashboard/pacientes/nuevo">Registrar nuevo paciente</a>
        </li>
      </ul>
    </div>
  )
}
