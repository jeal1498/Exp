import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/supabase/audit'
import { formatFecha, formatFechaHora } from '@/lib/format'
import {
  ESTADO_BATERIA_LABEL,
  TIPO_BATERIA_LABEL,
  INFORMANTE_LABEL,
  tscore_descriptor_conners,
  tscore_descriptor_brief,
} from '@/lib/evaluaciones/constants'
import type { EstadoBateria, TipoBateria, Informante } from '@/lib/evaluaciones/constants'
import type { Json } from '@/types/database.types'
import styles from '../../../../pacientes.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Batería de Evaluación — Expedientes Clínicos' }

const ESTADO_BADGE_COLOR: Record<EstadoBateria, string> = {
  en_curso: 'oklch(0.560 0.095 55)',
  puntuacion_pendiente: 'oklch(0.560 0.095 55)',
  borrador_informe: 'oklch(0.430 0.155 250)',
  firmado: 'oklch(0.430 0.130 155)',
  entregado: 'oklch(0.430 0.130 155)',
}

// Subescalas del perfil comparativo multi-informante para CONNERS-3 y BRIEF-2
const CONNERS_SUBESCALAS = [
  { key: 'inatención', label: 'Inaten.' },
  { key: 'hiperactividad_impulsividad', label: 'H/I' },
  { key: 'funcionamiento_ejecutivo', label: 'FE' },
  { key: 'agresión', label: 'Agres.' },
  { key: 'relaciones_pares', label: 'RP' },
  { key: 'indice_tdah', label: 'TDAH' },
]

const BRIEF_SUBESCALAS = [
  { key: 'inhibicion', label: 'Inhib.' },
  { key: 'flexibilidad', label: 'Flex.' },
  { key: 'control_emocional', label: 'CE' },
  { key: 'iniciativa', label: 'Inic.' },
  { key: 'memoria_trabajo', label: 'MT' },
  { key: 'planificacion_organizacion', label: 'Plan.' },
  { key: 'GEC', label: 'GEC' },
]

const INFORMANTE_COLORS: Record<string, string> = {
  padre: 'oklch(0.430 0.155 250)',
  madre: 'oklch(0.560 0.150 300)',
  maestro: 'oklch(0.560 0.150 60)',
  autoinforme: 'oklch(0.430 0.130 155)',
  observador: 'oklch(0.500 0.120 200)',
  karen: 'oklch(0.430 0.155 22)',
}

function renderMultiInformantChart(
  detalles: Array<{
    id: string
    informante: string
    instrumento_codigo: string
    puntajes_estandar: Json | null
  }>,
  instrCodigo: 'CONNERS3' | 'BRIEF2',
  umbral: number,
  umbral2: number | null,
) {
  const subescalas = instrCodigo === 'CONNERS3' ? CONNERS_SUBESCALAS : BRIEF_SUBESCALAS
  const rows = detalles.filter(
    d => d.instrumento_codigo === instrCodigo && d.puntajes_estandar !== null
  )
  if (rows.length === 0) return null

  const svgW = 800
  const svgH = 280
  const padL = 40
  const padR = 20
  const padT = 20
  const padB = 60
  const chartW = svgW - padL - padR
  const chartH = svgH - padT - padB

  const nSub = subescalas.length
  const nInf = rows.length
  const groupW = chartW / nSub
  const barW = Math.min(22, (groupW - 8) / nInf)

  const tMin = 20
  const tMax = 100
  const tRange = tMax - tMin

  function yFor(t: number) {
    return padT + chartH - ((t - tMin) / tRange) * chartH
  }

  const y65 = yFor(65)
  const y70 = umbral2 !== null ? yFor(70) : null

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width="100%"
      style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', overflow: 'visible' }}
      role="img"
      aria-label={`Perfil comparativo multi-informante ${instrCodigo}`}
    >
      {/* Y-axis ticks */}
      {[20, 30, 40, 50, 60, 70, 80, 90, 100].map(val => (
        <g key={val}>
          <line
            x1={padL - 4} y1={yFor(val)} x2={padL + chartW} y2={yFor(val)}
            stroke="oklch(0.900 0.000 0)" strokeWidth={1}
          />
          <text x={padL - 6} y={yFor(val) + 4} textAnchor="end" fill="oklch(0.500 0.000 0)" fontSize={10}>
            {val}
          </text>
        </g>
      ))}

      {/* Umbral BRIEF-2 T=65 */}
      <line
        x1={padL} y1={y65} x2={padL + chartW} y2={y65}
        stroke="oklch(0.650 0.150 60)" strokeWidth={1.5} strokeDasharray="6 3"
      />
      <text x={padL + chartW + 2} y={y65 + 4} fill="oklch(0.560 0.150 60)" fontSize={9}>T=65</text>

      {/* Umbral CONNERS-3 T=70 */}
      {y70 !== null && (
        <>
          <line
            x1={padL} y1={y70} x2={padL + chartW} y2={y70}
            stroke="oklch(0.500 0.155 22)" strokeWidth={1.5} strokeDasharray="6 3"
          />
          <text x={padL + chartW + 2} y={y70 + 4} fill="oklch(0.430 0.155 22)" fontSize={9}>T=70</text>
        </>
      )}

      {/* Baseline */}
      <line
        x1={padL} y1={yFor(50)} x2={padL + chartW} y2={yFor(50)}
        stroke="oklch(0.400 0.000 0)" strokeWidth={1}
      />

      {/* Bars */}
      {subescalas.map((sub, si) => {
        const groupX = padL + si * groupW
        const totalBarW = nInf * barW + (nInf - 1) * 3
        const startX = groupX + (groupW - totalBarW) / 2

        return (
          <g key={sub.key}>
            {rows.map((row, ri) => {
              const puntajes = row.puntajes_estandar as Record<string, unknown> | null
              const val = typeof puntajes?.[sub.key] === 'number' ? puntajes[sub.key] as number : null
              const x = startX + ri * (barW + 3)
              const color = INFORMANTE_COLORS[row.informante] ?? 'oklch(0.500 0.000 0)'

              if (val === null) return null

              const barTop = yFor(val)
              const barH = yFor(tMin) - barTop

              return (
                <g key={row.id + sub.key}>
                  <rect x={x} y={barTop} width={barW} height={barH} fill={color} opacity={0.8} rx={2} />
                  {val >= 65 && (
                    <text x={x + barW / 2} y={barTop - 3} textAnchor="middle" fill={color} fontSize={9} fontWeight="bold">
                      {val}
                    </text>
                  )}
                </g>
              )
            })}
            <text
              x={groupX + groupW / 2}
              y={padT + chartH + 18}
              textAnchor="middle"
              fill="oklch(0.400 0.000 0)"
              fontSize={10}
            >
              {sub.label}
            </text>
          </g>
        )
      })}

      {/* Legend */}
      {rows.map((row, i) => {
        const color = INFORMANTE_COLORS[row.informante] ?? 'oklch(0.500 0.000 0)'
        const lx = padL + i * 130
        const ly = padT + chartH + 38
        return (
          <g key={row.id + 'legend'}>
            <rect x={lx} y={ly - 8} width={12} height={12} fill={color} rx={2} />
            <text x={lx + 16} y={ly + 2} fill="oklch(0.350 0.000 0)" fontSize={11}>
              {INFORMANTE_LABEL[row.informante as Informante] ?? row.informante}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default async function BateriaDetallePage({
  params,
}: {
  params: Promise<{ pacienteId: string; bateriaId: string }>
}) {
  const { pacienteId, bateriaId } = await params
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const { data: bateria, error: bateriaError } = await supabase
    .from('baterias_evaluacion')
    .select('*')
    .eq('id', bateriaId)
    .eq('created_by', userData.user.id)
    .single()

  if (bateriaError || !bateria) redirect(`/dashboard/pacientes/${pacienteId}/baterias`)

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('id, nombre, apellido_paterno')
    .eq('id', pacienteId)
    .single()

  const { data: detallesRaw } = await supabase
    .from('evaluacion_instrumento_detalle')
    .select('id, instrumento_id, informante, nombre_informante, fecha_aplicacion, estado, puntajes_estandar')
    .eq('bateria_id', bateriaId)
    .order('created_at')

  // Join with catalogo info
  const { data: catalogo } = await supabase
    .from('instrumentos_catalogo')
    .select('id, codigo, nombre_corto, nombre_completo')

  const catalogoMap = Object.fromEntries((catalogo ?? []).map(i => [i.id, i]))

  const detalles = (detallesRaw ?? []).map(d => ({
    ...d,
    instrumento_codigo: catalogoMap[d.instrumento_id]?.codigo ?? '',
    instrumento_nombre: catalogoMap[d.instrumento_id]?.nombre_corto ?? '',
  }))

  await insertAuditLog(supabase, {
    usuario_id: userData.user.id,
    tabla_afectada: 'baterias_evaluacion',
    registro_id: bateriaId,
    accion: 'SELECT',
    datos_nuevos: { paciente_id: pacienteId },
  })

  const nombrePaciente = paciente
    ? `${paciente.nombre} ${paciente.apellido_paterno}`
    : 'Paciente'

  const total = detalles.length
  const puntuados = detalles.filter(d => d.estado === 'puntuado' || d.estado === 'revisado').length
  const todosPuntuados = total > 0 && puntuados === total

  // Group detalles by instrumento for the table display
  const byInstrumento: Record<string, typeof detalles> = {}
  for (const d of detalles) {
    const key = d.instrumento_id
    if (!byInstrumento[key]) byInstrumento[key] = []
    byInstrumento[key].push(d)
  }

  // Check if we have at least 2 scored instruments for the profile
  const scoredInstrumentos = new Set(
    detalles.filter(d => d.estado === 'puntuado' || d.estado === 'revisado').map(d => d.instrumento_id)
  )
  const showProfile = scoredInstrumentos.size >= 2

  const badgeColor = ESTADO_BADGE_COLOR[bateria.estado as EstadoBateria] ?? 'oklch(0.500 0.000 0)'

  // SVG progress bar
  const svgProgW = 400
  const svgProgH = 20
  const barFill = total > 0 ? (puntuados / total) * svgProgW : 0

  const connersDetalles = detalles.filter(d => d.instrumento_codigo === 'CONNERS3')
  const briefDetalles = detalles.filter(d => d.instrumento_codigo === 'BRIEF2')
  const connersScored = connersDetalles.filter(d => d.estado === 'puntuado' || d.estado === 'revisado')
  const briefScored = briefDetalles.filter(d => d.estado === 'puntuado' || d.estado === 'revisado')

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
          <li className={styles.breadcrumbItem}>
            <a href={`/dashboard/pacientes/${pacienteId}/baterias`}>Baterías</a>
          </li>
          <li className={styles.breadcrumbItem} aria-hidden="true">
            <span className={styles.breadcrumbSep}>›</span>
          </li>
          <li className={styles.breadcrumbItem} aria-current="page">
            {TIPO_BATERIA_LABEL[bateria.tipo as TipoBateria]}
          </li>
        </ol>
      </nav>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            {TIPO_BATERIA_LABEL[bateria.tipo as TipoBateria]}
          </h1>
          <span style={{
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: '999px',
            background: badgeColor,
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginTop: '4px',
          }}>
            {ESTADO_BATERIA_LABEL[bateria.estado as EstadoBateria]}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {todosPuntuados && !bateria.is_locked && (
            <a
              href={`/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}/informe`}
              className={styles.pageAction}
            >
              Generar informe
            </a>
          )}
          {bateria.informe_storage_path && (
            <a
              href={`/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}/informe`}
              className={styles.btnGhost}
            >
              Ver informe
            </a>
          )}
        </div>
      </div>

      {bateria.motivo_consulta && (
        <dl className={styles.metaList} style={{ marginBottom: '1.5rem' }}>
          <dt className={styles.metaLabel}>Motivo de consulta</dt>
          <dd className={styles.metaValue}>{bateria.motivo_consulta}</dd>
          <dt className={styles.metaLabel}>Registrado</dt>
          <dd className={styles.metaValue}>{formatFechaHora(bateria.created_at)}</dd>
        </dl>
      )}

      {/* Progress */}
      <h2 className={styles.sectionHeading}>Progreso</h2>
      <p style={{ fontSize: '0.9rem', color: 'oklch(0.450 0.000 0)', marginBottom: '0.5rem' }}>
        {puntuados} de {total} instrumentos puntuados
      </p>
      <div className={styles.chartWrapper} style={{ marginBottom: '1.5rem' }}>
        <svg viewBox={`0 0 ${svgProgW} ${svgProgH}`} width="100%" height={svgProgH}>
          <rect x={0} y={0} width={svgProgW} height={svgProgH} fill="oklch(0.930 0.000 0)" rx={4} />
          <rect x={0} y={0} width={barFill} height={svgProgH} fill="oklch(0.430 0.130 155)" rx={4} />
        </svg>
      </div>

      {/* Instrument table */}
      <h2 className={styles.sectionHeading}>Instrumentos</h2>
      {detalles.length === 0 ? (
        <p className={styles.empty}>No hay instrumentos en esta batería.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className={styles.th}>Instrumento</th>
                <th scope="col" className={styles.th}>Informante</th>
                <th scope="col" className={styles.th}>Fecha</th>
                <th scope="col" className={styles.th}>Estado</th>
                <th scope="col" className={styles.th}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(byInstrumento).map(([instrId, rows]) => {
                const nombre = rows[0]?.instrumento_nombre ?? instrId
                return rows.map((row, rowIdx) => (
                  <tr key={row.id} className={styles.tr}>
                    {rowIdx === 0 && (
                      <td
                        className={styles.td}
                        rowSpan={rows.length}
                        style={{ fontWeight: 600, verticalAlign: 'top', paddingTop: '0.75rem' }}
                      >
                        {nombre}
                      </td>
                    )}
                    <td className={styles.td}>
                      {INFORMANTE_LABEL[row.informante as Informante] ?? row.informante}
                      {row.nombre_informante && (
                        <span style={{ display: 'block', fontSize: '0.8em', color: 'oklch(0.500 0.000 0)' }}>
                          {row.nombre_informante}
                        </span>
                      )}
                    </td>
                    <td className={styles.td}>
                      {row.fecha_aplicacion ? formatFecha(row.fecha_aplicacion) : '—'}
                    </td>
                    <td className={styles.td}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: row.estado === 'puntuado' || row.estado === 'revisado'
                          ? 'oklch(0.900 0.080 155)'
                          : row.estado === 'aplicado'
                            ? 'oklch(0.900 0.080 55)'
                            : 'oklch(0.920 0.000 0)',
                        color: row.estado === 'puntuado' || row.estado === 'revisado'
                          ? 'oklch(0.350 0.130 155)'
                          : row.estado === 'aplicado'
                            ? 'oklch(0.400 0.095 55)'
                            : 'oklch(0.450 0.000 0)',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                      }}>
                        {row.estado === 'pendiente' ? 'Pendiente'
                          : row.estado === 'aplicado' ? 'Aplicado'
                            : row.estado === 'puntuado' ? 'Puntuado ✓'
                              : 'Revisado ✓'}
                      </span>
                    </td>
                    <td className={`${styles.td} ${styles.actionsCell}`}>
                      {!bateria.is_locked && (
                        <a
                          href={`/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}/instrumentos/${row.id}`}
                          className={styles.tableLink}
                        >
                          {row.estado === 'puntuado' || row.estado === 'revisado' ? 'Ver puntajes' : 'Capturar puntajes'}
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Perfil integrado */}
      {showProfile && (
        <>
          <h2 className={styles.sectionHeading}>Perfil Integrado</h2>

          {connersScored.length >= 2 && (
            <>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', color: 'oklch(0.350 0.000 0)' }}>
                CONNERS-3 — Comparativo multi-informante
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'oklch(0.500 0.000 0)', marginBottom: '0.5rem' }}>
                Línea roja discontinua = umbral clínico T≥70 · Línea naranja = T=65 (limítrofe)
              </p>
              <div className={styles.chartWrapper}>
                {renderMultiInformantChart(
                  connersScored.map(d => ({ ...d, instrumento_codigo: 'CONNERS3' })),
                  'CONNERS3',
                  70,
                  70,
                )}
              </div>
            </>
          )}

          {briefScored.length >= 2 && (
            <>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '1.5rem 0 0.5rem', color: 'oklch(0.350 0.000 0)' }}>
                BRIEF-2 — Comparativo multi-informante
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'oklch(0.500 0.000 0)', marginBottom: '0.5rem' }}>
                Línea naranja discontinua = umbral clínico T≥65
              </p>
              <div className={styles.chartWrapper}>
                {renderMultiInformantChart(
                  briefScored.map(d => ({ ...d, instrumento_codigo: 'BRIEF2' })),
                  'BRIEF2',
                  65,
                  null,
                )}
              </div>
            </>
          )}
        </>
      )}

      <a href={`/dashboard/pacientes/${pacienteId}/baterias`} className={styles.backLink}>
        <span aria-hidden="true">←</span>
        <span>Volver a baterías</span>
      </a>
    </div>
  )
}
