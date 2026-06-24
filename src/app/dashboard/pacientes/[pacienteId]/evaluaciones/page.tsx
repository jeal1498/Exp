import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Evaluaciones Neuropsicológicas — Expedientes Clínicos' }

const DOMINIOS_LABEL: Record<string, string> = {
  'Memoria':                    'Mem',
  'Atencion':                   'Aten',
  'Funciones Ejecutivas':       'FE',
  'Lenguaje':                   'Leng',
  'Visuoespacial':              'Visuo',
  'Velocidad de Procesamiento': 'VP',
  'Habilidades Academicas':     'HabAc',
  'Conducta y Emocion':         'CyE',
}

const DOMINIOS_ORDER = Object.keys(DOMINIOS_LABEL)

function barColor(percentil: number): string {
  if (percentil < 25) return '#c0392b'
  if (percentil < 75) return '#e67e22'
  return '#27ae60'
}

export default async function EvaluacionesPage({
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

  const { data: evaluaciones, error } = await supabase
    .from('evaluaciones_neuro')
    .select('id, fecha_evaluacion, nombre_prueba, dominio, puntaje_bruto, percentil, puntuacion_estandar, created_at')
    .eq('paciente_id', pacienteId)
    .order('fecha_evaluacion', { ascending: false })

  // NOM-024: registrar acceso SELECT a evaluaciones_neuro
  await supabase.from('logs_auditoria').insert({
    usuario_id:     userData.user.id,
    tabla_afectada: 'evaluaciones_neuro',
    registro_id:    null,
    accion:         'SELECT',
    datos_nuevos:   { paciente_id: pacienteId, count: evaluaciones?.length ?? 0 },
  })

  const nombrePaciente = paciente
    ? `${paciente.nombre} ${paciente.apellido_paterno}`
    : 'Paciente'

  // Compute highest percentil per domain for the bar chart
  const maxPercentilPorDominio: Record<string, number | null> = {}
  for (const d of DOMINIOS_ORDER) maxPercentilPorDominio[d] = null
  for (const ev of evaluaciones ?? []) {
    if (ev.percentil !== null && ev.percentil !== undefined) {
      const curr = maxPercentilPorDominio[ev.dominio]
      if (curr === null || ev.percentil > curr) {
        maxPercentilPorDominio[ev.dominio] = ev.percentil
      }
    }
  }

  // SVG chart constants
  const svgW = 640
  const svgH = 200
  const padL = 30
  const padR = 10
  const padT = 10
  const padB = 40
  const chartW = svgW - padL - padR
  const chartH = svgH - padT - padB
  const n = DOMINIOS_ORDER.length
  const barW = Math.floor(chartW / n) - 8

  return (
    <div>
      <p style={{ fontSize: '0.85em', color: '#555' }}>
        <a href="/dashboard/pacientes">Pacientes</a>
        {' › '}
        <a href={`/dashboard/pacientes/${pacienteId}`}>{nombrePaciente}</a>
        {' › Evaluaciones Neuropsicológicas'}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Evaluaciones Neuropsicológicas</h1>
        <a href={`/dashboard/pacientes/${pacienteId}/evaluaciones/nueva`}>
          + Nueva Evaluación
        </a>
      </div>

      {error && (
        <p role="alert" style={{ color: 'red', border: '1px solid red', padding: '8px' }}>
          Error al cargar evaluaciones: {error.message}
        </p>
      )}

      {!evaluaciones || evaluaciones.length === 0 ? (
        <p>
          No hay evaluaciones registradas para este paciente.{' '}
          <a href={`/dashboard/pacientes/${pacienteId}/evaluaciones/nueva`}>
            Registrar la primera evaluación.
          </a>
        </p>
      ) : (
        <>
          <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Prueba</th>
                <th>Dominio</th>
                <th>Puntaje bruto</th>
                <th>Percentil</th>
                <th>Puntaje estándar</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {evaluaciones.map((ev) => (
                <tr key={ev.id}>
                  <td>{new Date(ev.fecha_evaluacion).toLocaleDateString('es-MX')}</td>
                  <td>{ev.nombre_prueba}</td>
                  <td>{ev.dominio}</td>
                  <td style={{ textAlign: 'right' }}>{ev.puntaje_bruto ?? '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    {ev.percentil !== null && ev.percentil !== undefined ? (
                      <span style={{
                        color: barColor(ev.percentil),
                        fontWeight: 'bold',
                      }}>
                        {ev.percentil}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>{ev.puntuacion_estandar ?? '—'}</td>
                  <td>
                    <a href={`/dashboard/pacientes/${pacienteId}/evaluaciones/${ev.id}`}>Ver</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={{ marginTop: '32px' }}>Perfil de Rendimiento Cognitivo (percentil máximo por dominio)</h2>
          <p style={{ fontSize: '0.85em', color: '#555' }}>
            <span style={{ color: '#c0392b' }}>■</span> Bajo (&lt;25) &nbsp;
            <span style={{ color: '#e67e22' }}>■</span> Medio (25–74) &nbsp;
            <span style={{ color: '#27ae60' }}>■</span> Alto (≥75)
          </p>

          <svg
            width={svgW}
            height={svgH}
            style={{ fontFamily: 'sans-serif', fontSize: '11px', overflow: 'visible' }}
            role="img"
            aria-label="Gráfico de rendimiento cognitivo por dominio"
          >
            {/* Reference lines */}
            {[25, 50, 75].map((val) => {
              const y = padT + chartH - (val / 100) * chartH
              return (
                <g key={val}>
                  <line
                    x1={padL} y1={y} x2={padL + chartW} y2={y}
                    stroke="#ccc" strokeWidth={1} strokeDasharray="4 3"
                  />
                  <text x={padL - 4} y={y + 4} textAnchor="end" fill="#999">{val}</text>
                </g>
              )
            })}
            {/* Baseline */}
            <line x1={padL} y1={padT + chartH} x2={padL + chartW} y2={padT + chartH} stroke="#555" strokeWidth={1} />

            {/* Bars */}
            {DOMINIOS_ORDER.map((dominio, i) => {
              const slotW = chartW / n
              const x = padL + i * slotW + (slotW - barW) / 2
              const val = maxPercentilPorDominio[dominio]
              const barH = val !== null ? (val / 100) * chartH : 0
              const y = padT + chartH - barH
              const label = DOMINIOS_LABEL[dominio]

              return (
                <g key={dominio}>
                  {val !== null ? (
                    <rect
                      x={x} y={y} width={barW} height={barH}
                      fill={barColor(val)}
                      opacity={0.85}
                    />
                  ) : (
                    <rect
                      x={x} y={padT} width={barW} height={chartH}
                      fill="#eee" stroke="#ccc" strokeWidth={1}
                    />
                  )}
                  {val !== null && (
                    <text
                      x={x + barW / 2}
                      y={y - 3}
                      textAnchor="middle"
                      fill="#333"
                    >
                      {val}
                    </text>
                  )}
                  {val === null && (
                    <text
                      x={x + barW / 2}
                      y={padT + chartH / 2 + 4}
                      textAnchor="middle"
                      fill="#aaa"
                      fontSize={9}
                    >
                      —
                    </text>
                  )}
                  <text
                    x={x + barW / 2}
                    y={padT + chartH + 16}
                    textAnchor="middle"
                    fill="#555"
                  >
                    {label}
                  </text>
                </g>
              )
            })}
          </svg>
        </>
      )}

      <p style={{ marginTop: '16px' }}>
        <a href={`/dashboard/pacientes/${pacienteId}`}>← Volver al expediente</a>
      </p>
    </div>
  )
}
