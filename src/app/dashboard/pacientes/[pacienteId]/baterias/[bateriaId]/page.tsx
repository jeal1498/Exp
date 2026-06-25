import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/supabase/audit'
import { formatFecha } from '@/lib/format'
import styles from '../../../pacientes.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Batería de Evaluación — Expedientes Clínicos' }

const TIPO_LABELS: Record<string, string> = {
  tdah_nino:    'TDAH Infantil',
  tdah_adulto:  'TDAH Adulto',
  tea:          'TEA / Autismo',
  personalizada: 'Personalizada',
}

const ESTADO_LABELS: Record<string, string> = {
  en_curso:             'En curso',
  puntuacion_pendiente: 'Puntación pendiente',
  borrador_informe:     'Borrador informe',
  firmado:              'Firmado',
  entregado:            'Entregado',
}

const ESTADO_INSTRUMENTO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  aplicado:  'Aplicado',
  puntuado:  'Puntuado',
  revisado:  'Revisado',
}

const INFORMANTE_LABELS: Record<string, string> = {
  karen:       'Karen',
  padre:       'Padre',
  madre:       'Madre',
  maestro:     'Maestro',
  autoinforme: 'Autoinforme',
  observador:  'Observador',
}

function estadoBadgeClass(estado: string, s: typeof styles): string {
  if (estado === 'firmado' || estado === 'entregado') return `${s.badge} ${s.badgeLocked}`
  if (estado === 'borrador_informe') return `${s.badge} ${s.badgeDraft}`
  return `${s.badge}`
}

function estadoInstrumentoBadge(estado: string, s: typeof styles): string {
  if (estado === 'puntuado' || estado === 'revisado') return `${s.badge} ${s.badgeSuccess}`
  if (estado === 'aplicado') return `${s.badge} ${s.badgeDraft}`
  return `${s.badge}`
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

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('id, nombre, apellido_paterno')
    .eq('id', pacienteId)
    .eq('is_active', true)
    .single()

  const { data: bateria, error } = await supabase
    .from('baterias_evaluacion')
    .select('id, tipo, estado, motivo_consulta, is_locked, created_at')
    .eq('id', bateriaId)
    .single()

  const { data: detalles } = await supabase
    .from('evaluacion_instrumento_detalle')
    .select('id, informante, nombre_informante, estado, instrumento_id, instrumentos_catalogo(codigo, nombre_corto, nombre_completo)')
    .eq('bateria_id', bateriaId)
    .order('created_at', { ascending: true })

  await insertAuditLog(supabase, {
    usuario_id:     userData.user.id,
    tabla_afectada: 'baterias_evaluacion',
    registro_id:    bateriaId,
    accion:         'SELECT',
    datos_nuevos:   { paciente_id: pacienteId, bateria_id: bateriaId },
  })

  const nombrePaciente = paciente
    ? `${paciente.nombre} ${paciente.apellido_paterno}`
    : 'Paciente'

  const totalInstrumentos = detalles?.length ?? 0
  const puntuados = (detalles ?? []).filter(
    d => d.estado === 'puntuado' || d.estado === 'revisado'
  ).length

  const todosListos = totalInstrumentos > 0 && puntuados === totalInstrumentos
  const puedeGenerarInforme = todosListos && bateria && !bateria.is_locked

  // Group detalles by instrumento for display
  type Detalle = NonNullable<typeof detalles>[number]
  const agrupados: Map<string, { instrumento: NonNullable<Detalle['instrumentos_catalogo']>; items: Detalle[] }> = new Map()
  for (const d of detalles ?? []) {
    if (!d.instrumento_id) continue
    if (!agrupados.has(d.instrumento_id)) {
      agrupados.set(d.instrumento_id, {
        instrumento: d.instrumentos_catalogo as NonNullable<Detalle['instrumentos_catalogo']>,
        items: [],
      })
    }
    agrupados.get(d.instrumento_id)!.items.push(d)
  }

  const progresoPct = totalInstrumentos > 0 ? Math.round((puntuados / totalInstrumentos) * 100) : 0

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
            {bateria ? (TIPO_LABELS[bateria.tipo] ?? bateria.tipo) : 'Batería'}
          </li>
        </ol>
      </nav>

      {(error || !bateria) && (
        <p role="alert" className={styles.alert}>
          Batería no encontrada o sin acceso.
        </p>
      )}

      {bateria && (
        <>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              {TIPO_LABELS[bateria.tipo] ?? bateria.tipo}
            </h1>
            <span className={estadoBadgeClass(bateria.estado, styles)}>
              {ESTADO_LABELS[bateria.estado] ?? bateria.estado}
            </span>
          </div>

          <dl className={styles.metaList}>
            <dt className={styles.metaLabel}>Fecha de creación</dt>
            <dd className={styles.metaValue}>{formatFecha(bateria.created_at)}</dd>

            {bateria.motivo_consulta && (
              <>
                <dt className={styles.metaLabel}>Motivo de consulta</dt>
                <dd className={styles.metaValue}>{bateria.motivo_consulta}</dd>
              </>
            )}
          </dl>

          <hr className={styles.divider} />

          <h2 className={styles.sectionHeading}>Instrumentos</h2>

          {detalles && detalles.length > 0 ? (
            <div>
              {Array.from(agrupados.values()).map(({ instrumento, items }) => (
                <div key={items[0].instrumento_id} className={styles.instrumentoGroup}>
                  <h3 className={styles.instrumentoTitle}>
                    {instrumento?.nombre_corto ?? '—'}
                    {instrumento?.nombre_completo && (
                      <span className={styles.instrumentoSubtitle}> — {instrumento.nombre_completo}</span>
                    )}
                  </h3>
                  <table className={styles.table}>
                    <tbody>
                      {items.map((d) => (
                        <tr key={d.id} className={styles.tr}>
                          <td className={styles.td}>
                            {INFORMANTE_LABELS[d.informante] ?? d.informante}
                            {d.nombre_informante && (
                              <span className={styles.metaValue}> ({d.nombre_informante})</span>
                            )}
                          </td>
                          <td className={styles.td}>
                            <span className={estadoInstrumentoBadge(d.estado, styles)}>
                              {ESTADO_INSTRUMENTO_LABELS[d.estado] ?? d.estado}
                              {(d.estado === 'puntuado' || d.estado === 'revisado') && ' ✓'}
                            </span>
                          </td>
                          <td className={`${styles.td} ${styles.actionsCell}`}>
                            {!bateria.is_locked && (
                              <a
                                href={`/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}/instrumentos/${d.id}`}
                                className={styles.tableLink}
                              >
                                {d.estado === 'pendiente' || d.estado === 'aplicado'
                                  ? 'Capturar puntajes'
                                  : 'Ver puntajes'}
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>No hay instrumentos en esta batería.</p>
          )}

          {totalInstrumentos > 0 && (
            <div className={styles.progresoWrapper}>
              <p className={styles.progresoLabel}>
                {puntuados} de {totalInstrumentos} instrumentos puntuados
              </p>
              <svg
                viewBox="0 0 200 8"
                width="200"
                height="8"
                aria-hidden="true"
                className={styles.progresoBarra}
              >
                <rect x="0" y="0" width="200" height="8" fill="oklch(0.920 0.000 0)" rx="4" />
                <rect
                  x="0"
                  y="0"
                  width={progresoPct * 2}
                  height="8"
                  fill={puntuados === totalInstrumentos ? 'oklch(0.430 0.130 155)' : 'oklch(0.560 0.095 55)'}
                  rx="4"
                />
              </svg>
            </div>
          )}

          <div className={styles.formActions}>
            {puedeGenerarInforme ? (
              <a
                href={`/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}/informe`}
                className={styles.btnPrimary}
              >
                Generar informe
              </a>
            ) : bateria.is_locked ? (
              <a
                href={`/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}/informe`}
                className={styles.btnGhost}
              >
                Ver informe firmado
              </a>
            ) : (
              <button type="button" disabled className={styles.btnPrimary}>
                Generar informe
                {totalInstrumentos > 0 && !todosListos && (
                  <span> ({totalInstrumentos - puntuados} pendiente{totalInstrumentos - puntuados !== 1 ? 's' : ''})</span>
                )}
              </button>
            )}
          </div>
        </>
      )}

      <a href={`/dashboard/pacientes/${pacienteId}/baterias`} className={styles.backLink}>
        <span aria-hidden="true">←</span>
        <span>Volver a baterías</span>
      </a>
    </div>
  )
}
