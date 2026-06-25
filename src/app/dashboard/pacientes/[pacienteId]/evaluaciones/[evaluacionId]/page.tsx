import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/supabase/audit'
import { formatFecha } from '@/lib/format'
import styles from '../../../pacientes.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Detalle de Evaluación — Expedientes Clínicos' }

function percentilClass(p: number): string {
  if (p < 25) return styles.percentilLow
  if (p < 75) return styles.percentilMid
  return styles.percentilHigh
}

function percentilColor(p: number): string {
  if (p < 25) return 'oklch(0.430 0.155 22)'  // --color-error
  if (p < 75) return 'oklch(0.560 0.095 55)'  // --color-compliance
  return 'oklch(0.430 0.130 155)'              // --color-success
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
            <a href={`/dashboard/pacientes/${pacienteId}/evaluaciones`}>Evaluaciones</a>
          </li>
          <li className={styles.breadcrumbItem} aria-hidden="true">
            <span className={styles.breadcrumbSep}>›</span>
          </li>
          <li className={styles.breadcrumbItem} aria-current="page">
            Detalle
          </li>
        </ol>
      </nav>

      {(error || !ev) && (
        <p role="alert" className={styles.alert}>
          Evaluación no encontrada o sin acceso.
        </p>
      )}

      {ev && (
        <>
          <h1 className={styles.pageTitle}>Evaluación: {ev.nombre_prueba}</h1>

          <dl className={styles.metaList}>
            <dt className={styles.metaLabel}>Fecha de evaluación</dt>
            <dd className={styles.metaValue}>{formatFecha(ev.fecha_evaluacion)}</dd>

            <dt className={styles.metaLabel}>Prueba</dt>
            <dd className={styles.metaValue}>{ev.nombre_prueba}</dd>

            <dt className={styles.metaLabel}>Dominio cognitivo</dt>
            <dd className={styles.metaValue}>{ev.dominio}</dd>

            <dt className={styles.metaLabel}>Puntaje bruto</dt>
            <dd className={styles.metaValue}>{ev.puntaje_bruto ?? '—'}</dd>

            <dt className={styles.metaLabel}>Percentil</dt>
            <dd className={styles.metaValue}>
              {ev.percentil !== null && ev.percentil !== undefined ? (
                <>
                  <span className={percentilClass(ev.percentil)}>
                    {ev.percentil}
                  </span>
                  {' / 100'}
                  <div className={styles.chartWrapper}>
                    <svg
                      viewBox="0 0 300 24"
                      width="100%"
                      role="img"
                      aria-labelledby={`chart-pct-title-${ev.id}`}
                    >
                      <title id={`chart-pct-title-${ev.id}`}>Percentil {ev.percentil} de 100</title>
                      <rect x={0} y={6} width={300} height={12} fill="oklch(0.950 0.000 0)" rx={4} />
                      <rect
                        x={0} y={6}
                        width={Math.round((ev.percentil / 100) * 300)}
                        height={12}
                        fill={percentilColor(ev.percentil)}
                        rx={4}
                      />
                      <line x1={75}  y1={4} x2={75}  y2={20} stroke="oklch(0.510 0.016 200)" strokeWidth={1} />
                      <line x1={225} y1={4} x2={225} y2={20} stroke="oklch(0.510 0.016 200)" strokeWidth={1} />
                      <text x={75}  y={22} textAnchor="middle" fontSize={9} fill="oklch(0.510 0.016 200)">25</text>
                      <text x={225} y={22} textAnchor="middle" fontSize={9} fill="oklch(0.510 0.016 200)">75</text>
                    </svg>
                  </div>
                </>
              ) : '—'}
            </dd>

            <dt className={styles.metaLabel}>Puntuación estándar</dt>
            <dd className={styles.metaValue}>{ev.puntuacion_estandar ?? '—'}</dd>

            {ev.observaciones && (
              <>
                <dt className={styles.metaLabel}>Observaciones</dt>
                <dd className={styles.metaValue}>
                  <p className={styles.soapContent}>{ev.observaciones}</p>
                </dd>
              </>
            )}

            {ev.datos_adicionales && (
              <>
                <dt className={styles.metaLabel}>Datos adicionales</dt>
                <dd className={styles.metaValue}>
                  <code className={styles.hashBlock}>
                    {JSON.stringify(ev.datos_adicionales, null, 2)}
                  </code>
                </dd>
              </>
            )}

            <dt className={styles.metaLabel}>Registrado</dt>
            <dd className={styles.metaValue}>{formatFecha(ev.created_at)}</dd>
          </dl>

          <a href={`/dashboard/pacientes/${pacienteId}/evaluaciones`} className={styles.backLink}>
            <span aria-hidden="true">←</span>
            <span>Volver a evaluaciones</span>
          </a>
        </>
      )}
    </div>
  )
}
