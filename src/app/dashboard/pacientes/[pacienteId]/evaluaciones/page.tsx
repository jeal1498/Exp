import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/supabase/audit'
import { formatFecha } from '@/lib/format'
import { DOMINIOS, DOMINIOS_LABEL } from '@/lib/evaluaciones-constants'
import styles from '../../pacientes.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Evaluaciones Neuropsicológicas — Expedientes Clínicos' }

const DOMINIOS_ORDER = [...DOMINIOS]

// Returns OKLCH values matching design tokens exactly
function barColorVar(percentil: number): string {
  if (percentil < 25) return 'oklch(0.430 0.155 22)'   // --color-error
  if (percentil < 75) return 'oklch(0.560 0.095 55)'   // --color-compliance
  return 'oklch(0.430 0.130 155)'                       // --color-success
}

function percentilClass(percentil: number): string {
  if (percentil < 25) return styles.percentilLow
  if (percentil < 75) return styles.percentilMid
  return styles.percentilHigh
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
    .select('id, fecha_evaluacion, nombre_prueba, dominio, puntaje_bruto, percentil, puntuacion_estandar, is_locked, created_at')
    .eq('paciente_id', pacienteId)
    .order('fecha_evaluacion', { ascending: false })

  // NOM-024: registrar acceso SELECT a evaluaciones_neuro
  await insertAuditLog(supabase, {
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

  // SVG chart constants — viewBox-based for responsive scaling
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
      <nav aria-label="Migas de pan" className={styles.breadcrumb}>
        <ol className={styles.breadcrumbList}>
          <li className={styles.breadcrumbItem}>
            <a href="/dashboard/pacientes">Pacientes</a>
          </li>
          <li className={styles.breadcrumbItem} aria-hidden="true">
            <span className={styles.breadcrumbSep}>›</span>
          </li>
          <li className={styles.breadcrumbItem}>
            <a href={`/dashboard/pacientes/${pacienteId}`}>{nombrePaciente}</a>
          </li>
          <li className={styles.breadcrumbItem} aria-hidden="true">
            <span className={styles.breadcrumbSep}>›</span>
          </li>
          <li className={styles.breadcrumbItem} aria-current="page">
            Evaluaciones Neuropsicológicas
          </li>
        </ol>
      </nav>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Evaluaciones Neuropsicológicas</h1>
        <a href={`/dashboard/pacientes/${pacienteId}/evaluaciones/nueva`} className={styles.pageAction}>
          + Nueva Evaluación
        </a>
      </div>

      {error && (
        <p role="alert" className={styles.alert}>
          Error al cargar evaluaciones: {error.message}
        </p>
      )}

      {!evaluaciones || evaluaciones.length === 0 ? (
        <p className={styles.empty}>
          No hay evaluaciones registradas para este paciente.{' '}
          <a href={`/dashboard/pacientes/${pacienteId}/evaluaciones/nueva`} className={styles.tableLink}>
            Registrar la primera evaluación.
          </a>
        </p>
      ) : (
        <>
          <div
            className={styles.tableWrapper}
            role="region"
            aria-labelledby="tabla-evaluaciones-titulo"
            tabIndex={0}
          >
            <span id="tabla-evaluaciones-titulo" className="sr-only">Lista de evaluaciones neuropsicológicas</span>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col" className={styles.th}>Fecha</th>
                  <th scope="col" className={styles.th}>Prueba</th>
                  <th scope="col" className={styles.th}>Dominio</th>
                  <th scope="col" className={`${styles.th} ${styles.thNumeric}`}>Puntaje bruto</th>
                  <th scope="col" className={`${styles.th} ${styles.thNumeric}`}>Percentil</th>
                  <th scope="col" className={`${styles.th} ${styles.thNumeric}`}>Puntaje estándar</th>
                  <th scope="col" className={styles.th}>Estado</th>
                  <th scope="col" className={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {evaluaciones.map((ev) => (
                  <tr key={ev.id} className={styles.tr}>
                    <td className={styles.td}>{formatFecha(ev.fecha_evaluacion)}</td>
                    <td className={styles.td}>{ev.nombre_prueba}</td>
                    <td className={styles.td}>{ev.dominio}</td>
                    <td className={`${styles.td} ${styles.tdNumeric}`}>{ev.puntaje_bruto ?? '—'}</td>
                    <td className={`${styles.td} ${styles.tdNumeric}`}>
                      {ev.percentil !== null && ev.percentil !== undefined ? (
                        <span className={percentilClass(ev.percentil)}>
                          {ev.percentil}
                        </span>
                      ) : '—'}
                    </td>
                    <td className={`${styles.td} ${styles.tdNumeric}`}>{ev.puntuacion_estandar ?? '—'}</td>
                    <td className={styles.td}>
                      {ev.is_locked ? (
                        <span className={`${styles.badge} ${styles.badgeLocked}`}>Bloqueada</span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgeDraft}`}>Borrador</span>
                      )}
                    </td>
                    <td className={`${styles.td} ${styles.actionsCell}`}>
                      <a
                        href={`/dashboard/pacientes/${pacienteId}/evaluaciones/${ev.id}`}
                        className={styles.tableLink}
                      >
                        Ver
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className={styles.sectionHeading}>Perfil de Rendimiento Cognitivo (percentil máximo por dominio)</h2>

          <div className={styles.chartLegend}>
            <span className={styles.chartLegendItem}>
              <span className={styles.percentilLow} aria-hidden="true">■</span> Bajo (&lt;25)
            </span>
            <span className={styles.chartLegendItem}>
              <span className={styles.percentilMid} aria-hidden="true">■</span> Medio (25–74)
            </span>
            <span className={styles.chartLegendItem}>
              <span className={styles.percentilHigh} aria-hidden="true">■</span> Alto (≥75)
            </span>
          </div>

          <div className={styles.chartWrapper}>
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              width="100%"
              style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', overflow: 'visible' }}
              role="img"
              aria-labelledby="chart-title chart-desc"
            >
              <title id="chart-title">Perfil de rendimiento cognitivo por dominio</title>
              <desc id="chart-desc">
                Gráfico de barras con el percentil máximo registrado por dominio cognitivo: {
                  DOMINIOS_ORDER
                    .filter(d => maxPercentilPorDominio[d] !== null)
                    .map(d => `${d}: ${maxPercentilPorDominio[d]}`)
                    .join(', ') || 'sin datos disponibles'
                }
              </desc>

              {/* Reference lines */}
              {[25, 50, 75].map((val) => {
                const y = padT + chartH - (val / 100) * chartH
                return (
                  <g key={val}>
                    <line
                      x1={padL} y1={y} x2={padL + chartW} y2={y}
                      stroke="oklch(0.850 0.000 0)" strokeWidth={1} strokeDasharray="4 3"
                    />
                    <text x={padL - 4} y={y + 4} textAnchor="end" fill="oklch(0.600 0.000 0)">{val}</text>
                  </g>
                )
              })}
              {/* Baseline */}
              <line
                x1={padL} y1={padT + chartH} x2={padL + chartW} y2={padT + chartH}
                stroke="oklch(0.400 0.000 0)" strokeWidth={1}
              />

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
                        fill={barColorVar(val)}
                        opacity={0.85}
                      />
                    ) : (
                      <rect
                        x={x} y={padT} width={barW} height={chartH}
                        fill="oklch(0.950 0.000 0)" stroke="oklch(0.850 0.000 0)" strokeWidth={1}
                      />
                    )}
                    {val !== null && (
                      <text
                        x={x + barW / 2}
                        y={y - 3}
                        textAnchor="middle"
                        fill="oklch(0.300 0.000 0)"
                      >
                        {val}
                      </text>
                    )}
                    {val === null && (
                      <text
                        x={x + barW / 2}
                        y={padT + chartH / 2 + 4}
                        textAnchor="middle"
                        fill="oklch(0.700 0.000 0)"
                        fontSize={9}
                      >
                        —
                      </text>
                    )}
                    <text
                      x={x + barW / 2}
                      y={padT + chartH + 16}
                      textAnchor="middle"
                      fill="oklch(0.400 0.000 0)"
                    >
                      {label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </>
      )}

      <a href={`/dashboard/pacientes/${pacienteId}`} className={styles.backLink}>
        <span aria-hidden="true">←</span>
        <span>Volver al expediente</span>
      </a>
    </div>
  )
}
