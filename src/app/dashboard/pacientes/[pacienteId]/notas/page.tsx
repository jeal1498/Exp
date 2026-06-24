import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Notas de Evolución — Expedientes Clínicos' }

export default async function NotasPage({
  params,
}: {
  params: Promise<{ pacienteId: string }>
}) {
  const { pacienteId } = await params
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('id, nombre, apellido_paterno')
    .eq('id', pacienteId)
    .eq('is_active', true)
    .single()

  const { data: notas, error } = await supabase
    .from('notas_evolucion')
    .select('id, fecha_nota, subjetivo, codigo_cie11, descripcion_cie11, is_locked, locked_at, created_at')
    .eq('paciente_id', pacienteId)
    .order('fecha_nota', { ascending: false })

  // NOM-024: registrar acceso SELECT a notas_evolucion
  await supabase.from('logs_auditoria').insert({
    usuario_id: userData.user.id,
    tabla_afectada: 'notas_evolucion',
    registro_id: null,
    accion: 'SELECT',
    datos_nuevos: { paciente_id: pacienteId, count: notas?.length ?? 0 },
  })

  const nombrePaciente = paciente
    ? `${paciente.nombre} ${paciente.apellido_paterno}`
    : 'Paciente'

  return (
    <div>
      <p style={{ fontSize: '0.85em', color: '#555' }}>
        <a href="/dashboard/pacientes">Pacientes</a>
        {' › '}
        <a href={`/dashboard/pacientes/${pacienteId}`}>{nombrePaciente}</a>
        {' › Notas de Evolución'}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Notas de Evolución</h1>
        <a href={`/dashboard/pacientes/${pacienteId}/notas/nueva`}>
          + Nueva Nota SOAP
        </a>
      </div>

      {error && (
        <p role="alert" style={{ color: 'red', border: '1px solid red', padding: '8px' }}>
          Error al cargar notas: {error.message}
        </p>
      )}

      {!notas || notas.length === 0 ? (
        <p>
          No hay notas registradas para este paciente.{' '}
          <a href={`/dashboard/pacientes/${pacienteId}/notas/nueva`}>
            Crear la primera nota.
          </a>
        </p>
      ) : (
        <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Diagnóstico CIE-11</th>
              <th>Subjetivo (resumen)</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {notas.map((nota) => (
              <tr key={nota.id}>
                <td>{new Date(nota.fecha_nota).toLocaleDateString('es-MX')}</td>
                <td>
                  {nota.codigo_cie11
                    ? `${nota.codigo_cie11}${nota.descripcion_cie11 ? ' — ' + nota.descripcion_cie11 : ''}`
                    : '—'}
                </td>
                <td>
                  {nota.subjetivo
                    ? nota.subjetivo.length > 80
                      ? nota.subjetivo.slice(0, 80) + '…'
                      : nota.subjetivo
                    : '—'}
                </td>
                <td>
                  {nota.is_locked ? (
                    <span style={{ color: 'red', fontWeight: 'bold' }}>Bloqueada</span>
                  ) : (
                    <span style={{ color: 'green' }}>Borrador</span>
                  )}
                </td>
                <td>
                  <a href={`/dashboard/pacientes/${pacienteId}/notas/${nota.id}`}>Ver</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ marginTop: '16px' }}>
        <a href={`/dashboard/pacientes/${pacienteId}`}>← Volver al expediente</a>
      </p>
    </div>
  )
}
