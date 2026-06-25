import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/supabase/audit'
import { formatFecha } from '@/lib/format'
import styles from '../../pacientes.module.css'
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
  await insertAuditLog(supabase, {
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
            Notas de Evolución
          </li>
        </ol>
      </nav>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Notas de Evolución</h1>
        <a href={`/dashboard/pacientes/${pacienteId}/notas/nueva`} className={styles.pageAction}>
          + Nueva Nota SOAP
        </a>
      </div>

      {error && (
        <p role="alert" className={styles.alert}>
          Error al cargar notas: {error.message}
        </p>
      )}

      {!notas || notas.length === 0 ? (
        <p className={styles.empty}>
          No hay notas registradas para este paciente.{' '}
          <a href={`/dashboard/pacientes/${pacienteId}/notas/nueva`} className={styles.tableLink}>
            Crear la primera nota.
          </a>
        </p>
      ) : (
        <div
          className={styles.tableWrapper}
          role="region"
          aria-labelledby="tabla-notas-titulo"
          tabIndex={0}
        >
          <span id="tabla-notas-titulo" className="sr-only">Lista de notas de evolución</span>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className={styles.th}>Fecha</th>
                <th scope="col" className={styles.th}>Diagnóstico CIE-11</th>
                <th scope="col" className={styles.th}>Subjetivo (resumen)</th>
                <th scope="col" className={styles.th}>Estado</th>
                <th scope="col" className={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {notas.map((nota) => {
                const resumen = nota.subjetivo
                  ? nota.subjetivo.length > 80
                    ? nota.subjetivo.slice(0, 80) + '…'
                    : nota.subjetivo
                  : '—'
                return (
                  <tr key={nota.id} className={styles.tr}>
                    <td className={styles.td}>{formatFecha(nota.fecha_nota)}</td>
                    <td className={styles.td}>
                      {nota.codigo_cie11
                        ? `${nota.codigo_cie11}${nota.descripcion_cie11 ? ' — ' + nota.descripcion_cie11 : ''}`
                        : '—'}
                    </td>
                    <td className={styles.td} title={nota.subjetivo ?? undefined}>{resumen}</td>
                    <td className={styles.td}>
                      {nota.is_locked ? (
                        <span className={`${styles.badge} ${styles.badgeLocked}`}>Bloqueada</span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgeDraft}`}>Borrador</span>
                      )}
                    </td>
                    <td className={`${styles.td} ${styles.actionsCell}`}>
                      <a
                        href={`/dashboard/pacientes/${pacienteId}/notas/${nota.id}`}
                        className={styles.tableLink}
                      >
                        Ver
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
