import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/supabase/audit'
import { formatFecha } from '@/lib/format'
import styles from '../../pacientes.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Baterías de Evaluación — Expedientes Clínicos' }

const TIPO_LABELS: Record<string, string> = {
  tdah_nino:   'TDAH Infantil',
  tdah_adulto: 'TDAH Adulto',
  tea:         'TEA / Autismo',
  personalizada: 'Personalizada',
}

const ESTADO_LABELS: Record<string, string> = {
  en_curso:           'En curso',
  puntuacion_pendiente: 'Puntación pendiente',
  borrador_informe:   'Borrador informe',
  firmado:            'Firmado',
  entregado:          'Entregado',
}

function estadoBadgeClass(estado: string, s: typeof styles): string {
  if (estado === 'firmado' || estado === 'entregado') return `${s.badge} ${s.badgeLocked}`
  if (estado === 'borrador_informe') return `${s.badge} ${s.badgeDraft}`
  return `${s.badge}`
}

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
    .select('id, tipo, estado, created_at, motivo_consulta')
    .eq('paciente_id', pacienteId)
    .order('created_at', { ascending: false })

  // Fetch instrument detail counts for each battery
  const bateriaIds = (baterias ?? []).map(b => b.id)
  const { data: detalles } = bateriaIds.length > 0
    ? await supabase
        .from('evaluacion_instrumento_detalle')
        .select('bateria_id, estado')
        .in('bateria_id', bateriaIds)
    : { data: [] }

  await insertAuditLog(supabase, {
    usuario_id:     userData.user.id,
    tabla_afectada: 'baterias_evaluacion',
    registro_id:    null,
    accion:         'SELECT',
    datos_nuevos:   { paciente_id: pacienteId, count: baterias?.length ?? 0 },
  })

  const nombrePaciente = paciente
    ? `${paciente.nombre} ${paciente.apellido_paterno}`
    : 'Paciente'

  const progresoPorBateria: Record<string, { total: number; puntuados: number }> = {}
  for (const b of baterias ?? []) {
    progresoPorBateria[b.id] = { total: 0, puntuados: 0 }
  }
  for (const d of detalles ?? []) {
    if (progresoPorBateria[d.bateria_id]) {
      progresoPorBateria[d.bateria_id].total++
      if (d.estado === 'puntuado' || d.estado === 'revisado') {
        progresoPorBateria[d.bateria_id].puntuados++
      }
    }
  }

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
        <a href={`/dashboard/pacientes/${pacienteId}/baterias/nueva`} className={styles.pageAction}>
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
          No hay baterías registradas para este paciente.{' '}
          <a href={`/dashboard/pacientes/${pacienteId}/baterias/nueva`} className={styles.tableLink}>
            Crear la primera batería.
          </a>
        </p>
      ) : (
        <div
          className={styles.tableWrapper}
          role="region"
          aria-labelledby="tabla-baterias-titulo"
          tabIndex={0}
        >
          <span id="tabla-baterias-titulo" className="sr-only">Lista de baterías de evaluación</span>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className={styles.th}>Fecha</th>
                <th scope="col" className={styles.th}>Tipo</th>
                <th scope="col" className={styles.th}>Estado</th>
                <th scope="col" className={styles.th}>Progreso</th>
                <th scope="col" className={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {baterias.map((b) => {
                const prog = progresoPorBateria[b.id]
                return (
                  <tr key={b.id} className={styles.tr}>
                    <td className={styles.td}>{formatFecha(b.created_at)}</td>
                    <td className={styles.td}>{TIPO_LABELS[b.tipo] ?? b.tipo}</td>
                    <td className={styles.td}>
                      <span className={estadoBadgeClass(b.estado, styles)}>
                        {ESTADO_LABELS[b.estado] ?? b.estado}
                      </span>
                    </td>
                    <td className={styles.td}>
                      {prog.total > 0
                        ? `${prog.puntuados} / ${prog.total} puntuados`
                        : '—'}
                    </td>
                    <td className={`${styles.td} ${styles.actionsCell}`}>
                      <a
                        href={`/dashboard/pacientes/${pacienteId}/baterias/${b.id}`}
                        className={styles.tableLink}
                      >
                        Ver batería
                      </a>
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
