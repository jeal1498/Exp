import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/supabase/audit'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Detalle de Evaluación — Expedientes Clínicos' }

function percentilColor(p: number): string {
  if (p < 25) return '#c0392b'
  if (p < 75) return '#e67e22'
  return '#27ae60'
}

export default async function EvaluacionDetallePage({
  params,
}: {
  params: Promise<{ pacienteId: string; evaluacionId: string }>
}) {
  const { pacienteId, evaluacionId } = await params
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('id, nombre, apellido_paterno')
    .eq('id', pacienteId)
    .eq('is_active', true)
    .single()

  const { data: ev, error } = await supabase
    .from('evaluaciones_neuro')
    .select('id, fecha_evaluacion, nombre_prueba, dominio, puntaje_bruto, percentil, puntuacion_estandar, observaciones, datos_adicionales, created_at')
    .eq('id', evaluacionId)
    .eq('paciente_id', pacienteId)
    .single()

  // NOM-024: registrar acceso SELECT a evaluaciones_neuro
  await insertAuditLog(supabase, {
    usuario_id:     userData.user.id,
    tabla_afectada: 'evaluaciones_neuro',
    registro_id:    evaluacionId,
    accion:         'SELECT',
    datos_nuevos:   { paciente_id: pacienteId },
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
        {' › '}
        <a href={`/dashboard/pacientes/${pacienteId}/evaluaciones`}>Evaluaciones</a>
        {' › Detalle'}
      </p>

      {(error || !ev) && (
        <p role="alert" style={{ color: 'red', border: '1px solid red', padding: '8px' }}>
          Evaluación no encontrada o sin acceso.
        </p>
      )}

      {ev && (
        <>
          <h1>Evaluación: {ev.nombre_prueba}</h1>

          <dl style={{ lineHeight: '1.8' }}>
            <dt><strong>Fecha de evaluación</strong></dt>
            <dd>{new Date(ev.fecha_evaluacion).toLocaleDateString('es-MX')}</dd>

            <dt><strong>Prueba</strong></dt>
            <dd>{ev.nombre_prueba}</dd>

            <dt><strong>Dominio cognitivo</strong></dt>
            <dd>{ev.dominio}</dd>

            <dt><strong>Puntaje bruto</strong></dt>
            <dd>{ev.puntaje_bruto ?? '—'}</dd>

            <dt><strong>Percentil</strong></dt>
            <dd>
              {ev.percentil !== null && ev.percentil !== undefined ? (
                <>
                  <span style={{ fontWeight: 'bold', color: percentilColor(ev.percentil) }}>
                    {ev.percentil}
                  </span>
                  {' / 100'}
                  <div style={{ marginTop: '6px' }}>
                    <svg width={300} height={24} role="img" aria-label={`Percentil ${ev.percentil}`}>
                      <rect x={0} y={6} width={300} height={12} fill="#eee" rx={4} />
                      <rect
                        x={0} y={6}
                        width={Math.round((ev.percentil / 100) * 300)}
                        height={12}
                        fill={percentilColor(ev.percentil)}
                        rx={4}
                      />
                      {/* Reference markers at 25 and 75 */}
                      <line x1={75}  y1={4} x2={75}  y2={20} stroke="#555" strokeWidth={1} />
                      <line x1={225} y1={4} x2={225} y2={20} stroke="#555" strokeWidth={1} />
                      <text x={75}  y={22} textAnchor="middle" fontSize={9} fill="#555">25</text>
                      <text x={225} y={22} textAnchor="middle" fontSize={9} fill="#555">75</text>
                    </svg>
                  </div>
                </>
              ) : '—'}
            </dd>

            <dt><strong>Puntuación estándar</strong></dt>
            <dd>{ev.puntuacion_estandar ?? '—'}</dd>

            {ev.observaciones && (
              <>
                <dt><strong>Observaciones</strong></dt>
                <dd style={{ whiteSpace: 'pre-wrap' }}>{ev.observaciones}</dd>
              </>
            )}

            {ev.datos_adicionales && (
              <>
                <dt><strong>Datos adicionales</strong></dt>
                <dd>
                  <pre style={{ background: '#f5f5f5', padding: '8px', fontSize: '0.85em' }}>
                    {JSON.stringify(ev.datos_adicionales, null, 2)}
                  </pre>
                </dd>
              </>
            )}

            <dt><strong>Registrado</strong></dt>
            <dd>{new Date(ev.created_at).toLocaleDateString('es-MX')}</dd>
          </dl>

          <p style={{ marginTop: '16px' }}>
            <a href={`/dashboard/pacientes/${pacienteId}/evaluaciones`}>← Volver a evaluaciones</a>
          </p>
        </>
      )}
    </div>
  )
}
