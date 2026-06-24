import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pacientes — Expedientes Clínicos' }

export default async function PacientesPage() {
  const supabase = await createClient()
  const { data: pacientes, error } = await supabase
    .from('pacientes')
    .select('id, numero_expediente, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, curp, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Pacientes</h1>
        <a href="/dashboard/pacientes/nuevo">+ Registrar nuevo paciente</a>
      </div>

      {error && (
        <p role="alert" style={{ color: 'red' }}>
          Error al cargar pacientes: {error.message}
        </p>
      )}

      {!pacientes || pacientes.length === 0 ? (
        <p>No hay pacientes registrados. <a href="/dashboard/pacientes/nuevo">Registra el primero.</a></p>
      ) : (
        <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>No. Expediente</th>
              <th>Nombre</th>
              <th>CURP</th>
              <th>Fecha de nacimiento</th>
              <th>Registrado</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((p) => (
              <tr key={p.id}>
                <td>{p.numero_expediente}</td>
                <td>
                  <a href={`/dashboard/pacientes/${p.id}`}>
                    {p.nombre} {p.apellido_paterno} {p.apellido_materno ?? ''}
                  </a>
                </td>
                <td>
                  <code>{p.curp}</code>
                </td>
                <td>{p.fecha_nacimiento}</td>
                <td>{new Date(p.created_at).toLocaleDateString('es-MX')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
