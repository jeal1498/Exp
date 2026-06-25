import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/supabase/audit'
import { formatFecha } from '@/lib/format'
import { ESTADO_BATERIA_LABEL, TIPO_BATERIA_LABEL } from '@/lib/evaluaciones/constants'
import type { EstadoBateria, TipoBateria } from '@/lib/evaluaciones/constants'
import styles from '../../../pacientes.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Baterías de Evaluación — Expedientes Clínicos' }

export default async function BateriasPage({
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

  const { data: baterias, error } = await supabase
    .from('baterias_evaluacion')
    .select('id, tipo, estado, motivo_consulta, created_at, is_locked, informe_storage_path')
    .eq('paciente_id', pacienteId)
    .order('created_at', { ascending: false })

  // Get instrument counts per battery
  const { data: conteos } = await supabase
    .from('evaluacion_instrumento_detalle')
    .select('bateria_id, estado')
    .in('bateria_id', (baterias ?? []).map(b => b.id))

  const countsByBateria: Record<string, { total: number; puntuados: number }> = {}
  for (const row of conteos ?? []) {
    if (!countsByBateria[row.bateria_id]) countsByBateria[row.bateria_id] = { total: 0, puntuados: 0 }
    countsByBateria[row.bateria_id].total++
    if (row.estado === 'puntuado' || row.estado === 'revisado') {
      countsByBateria[row.bateria_id].puntuados++
    }
  }

  await insertAuditLog(supabase, {
    usuario_id: userData.user.id,
    tabla_afectada: 'baterias_evaluacion',
    registro_id: null,
    accion: 'SELECT',
    datos_nuevos: { paciente_id: pacienteId, count: baterias?.length ?? 0 },
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
          <li className={styles.breadcrumbItem} aria-current="page">
            Baterías de Evaluación
          </li>
        </ol>
      </nav>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Baterías de Evaluación</h1>
        <a
          href={`/dashboard/pacientes/${pacienteId}/baterias/nueva`}
          className={styles.pageAction}
        >
          + Nueva Batería
        </a>
      </div>

      {error && (
        <p role="alert" className={styles.alert}>
          Error al cargar baterías: {error.message}
        </p>
      )}

      {!baterias || baterias.length === 0 ? (
        <p className={styles.empty}>
          No hay baterías registradas.{' '}
          <a
            href={`/dashboard/pacientes/${pacienteId}/baterias/nueva`}
            className={styles.tableLink}
          >
            Crear la primera batería.
          </a>
        </p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className={styles.th}>Fecha</th>
                <th scope="col" className={styles.th}>Tipo</th>
                <th scope="col" className={styles.th}>Estado</th>
                <th scope="col" className={`${styles.th} ${styles.thNumeric}`}>Instrumentos</th>
                <th scope="col" className={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {baterias.map((b) => {
                const counts = countsByBateria[b.id] ?? { total: 0, puntuados: 0 }
                return (
                  <tr key={b.id} className={styles.tr}>
                    <td className={styles.td}>{formatFecha(b.created_at)}</td>
                    <td className={styles.td}>{TIPO_BATERIA_LABEL[b.tipo as TipoBateria]}</td>
                    <td className={styles.td}>
                      {ESTADO_BATERIA_LABEL[b.estado as EstadoBateria]}
                      {b.is_locked && (
                        <span style={{
                          marginLeft: '6px',
                          fontSize: '0.75rem',
                          color: 'oklch(0.430 0.130 155)',
                          fontWeight: 600,
                        }}>
                          🔒 Firmada
                        </span>
                      )}
                    </td>
                    <td className={`${styles.td} ${styles.tdNumeric}`}>
                      {counts.puntuados}/{counts.total}
                    </td>
                    <td className={`${styles.td} ${styles.actionsCell}`}>
                      <a
                        href={`/dashboard/pacientes/${pacienteId}/baterias/${b.id}`}
                        className={styles.tableLink}
                      >
                        Ver
                      </a>
                      {b.informe_storage_path && (
                        <a
                          href={`/dashboard/pacientes/${pacienteId}/baterias/${b.id}/informe`}
                          className={styles.tableLink}
                          style={{ marginLeft: '0.75rem' }}
                        >
                          Informe
                        </a>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <a href={`/dashboard/pacientes/${pacienteId}`} className={styles.backLink}>
        <span aria-hidden="true">←</span>
        <span>Volver al expediente</span>
      </a>
    </div>
  )
}
