import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { bloquearNota } from './actions'
import { insertAuditLog } from '@/lib/supabase/audit'
import { formatFecha, formatFechaHora } from '@/lib/format'
import styles from '../../../pacientes.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nota de Evolución — Expedientes Clínicos' }

export default async function NotaDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ pacienteId: string; notaId: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { pacienteId, notaId } = await params
  const sp = await searchParams

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('id, nombre, apellido_paterno')
    .eq('id', pacienteId)
    .eq('is_active', true)
    .single()

  const { data: nota, error } = await supabase
    .from('notas_evolucion')
    .select('*')
    .eq('id', notaId)
    .eq('paciente_id', pacienteId)
    .single()

  // NOM-024: registrar acceso SELECT a esta nota
  if (nota) {
    await insertAuditLog(supabase, {
      usuario_id:     userData.user.id,
      tabla_afectada: 'notas_evolucion',
      registro_id:    notaId,
      accion:         'SELECT',
      datos_nuevos:   { paciente_id: pacienteId },
    })
  }

  const nombrePaciente = paciente
    ? `${paciente.nombre} ${paciente.apellido_paterno}`
    : 'Paciente'

  const bloquearNotaBound = bloquearNota.bind(null, pacienteId, notaId)

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
            <a href={`/dashboard/pacientes/${pacienteId}/notas`}>Notas de Evolución</a>
          </li>
          <li className={styles.breadcrumbItem} aria-hidden="true">
            <span className={styles.breadcrumbSep}>›</span>
          </li>
          <li className={styles.breadcrumbItem} aria-current="page">
            Nota
          </li>
        </ol>
      </nav>

      {sp.error && (
        <p role="alert" className={styles.alert}>
          {decodeURIComponent(sp.error)}
        </p>
      )}

      {(error || !nota) && (
        <p role="alert" className={styles.alert}>
          Nota no encontrada o sin acceso.
        </p>
      )}

      {nota && (
        <>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Nota de Evolución</h1>
            {nota.is_locked ? (
              <span className={`${styles.badge} ${styles.badgeLocked}`}>BLOQUEADA — NOM-004 Art. 9</span>
            ) : (
              <span className={`${styles.badge} ${styles.badgeDraft}`}>BORRADOR</span>
            )}
          </div>

          <dl className={styles.metaList}>
            <dt className={styles.metaLabel}>Fecha de la nota</dt>
            <dd className={styles.metaValue}>{formatFechaHora(nota.fecha_nota)}</dd>

            {nota.codigo_cie11 && (
              <>
                <dt className={styles.metaLabel}>Código CIE-11</dt>
                <dd className={`${styles.metaValue} ${styles.metaValueMono}`}>{nota.codigo_cie11}</dd>
              </>
            )}

            {nota.descripcion_cie11 && (
              <>
                <dt className={styles.metaLabel}>Diagnóstico</dt>
                <dd className={styles.metaValue}>{nota.descripcion_cie11}</dd>
              </>
            )}
          </dl>

          <hr className={styles.divider} />

          <h2 className={styles.sectionHeading}>Nota SOAP</h2>

          <section className={styles.soapSection}>
            <h3 className={styles.soapHeading}>S — Subjetivo</h3>
            {nota.subjetivo
              ? <p className={styles.soapContent}>{nota.subjetivo}</p>
              : <p className={styles.soapEmpty}>No registrado</p>
            }
          </section>

          <section className={styles.soapSection}>
            <h3 className={styles.soapHeading}>O — Objetivo</h3>
            {nota.objetivo
              ? <p className={styles.soapContent}>{nota.objetivo}</p>
              : <p className={styles.soapEmpty}>No registrado</p>
            }
          </section>

          <section className={styles.soapSection}>
            <h3 className={styles.soapHeading}>A — Análisis</h3>
            {nota.analisis
              ? <p className={styles.soapContent}>{nota.analisis}</p>
              : <p className={styles.soapEmpty}>No registrado</p>
            }
          </section>

          <section className={styles.soapSection}>
            <h3 className={styles.soapHeading}>P — Plan</h3>
            {nota.plan
              ? <p className={styles.soapContent}>{nota.plan}</p>
              : <p className={styles.soapEmpty}>No registrado</p>
            }
          </section>

          <hr className={styles.divider} />

          <h2 className={styles.sectionHeading}>Inalterabilidad (NOM-004 Art. 9 / NOM-024)</h2>

          {nota.is_locked ? (
            <dl className={styles.metaList}>
              <dt className={styles.metaLabel}>Bloqueada el</dt>
              <dd className={styles.metaValue}>{formatFechaHora(nota.locked_at!)}</dd>

              <dt className={styles.metaLabel}>Hash de integridad SHA-256 (NOM-024)</dt>
              <dd className={styles.metaValue}>
                <code className={styles.hashBlock}>{nota.hash_integridad}</code>
              </dd>
            </dl>
          ) : (
            <div>
              <p className={styles.lockWarning}>
                Una vez bloqueada, la nota no puede modificarse (NOM-004 Art. 9).
                El sistema generará un hash SHA-256 del contenido para garantizar su integridad (NOM-024).
              </p>
              <form action={bloquearNotaBound}>
                <button type="submit" className={styles.btnPrimary}>
                  Bloquear Nota (acción irreversible)
                </button>
              </form>
            </div>
          )}

          <hr className={styles.divider} />

          <dl className={`${styles.metaList} ${styles.auditMeta}`}>
            <dt className={styles.metaLabel}>Creada</dt>
            <dd className={styles.metaValue}>{formatFechaHora(nota.created_at)}</dd>

            <dt className={styles.metaLabel}>Última modificación</dt>
            <dd className={styles.metaValue}>{formatFechaHora(nota.updated_at)}</dd>
          </dl>

          <a href={`/dashboard/pacientes/${pacienteId}/notas`} className={styles.backLink}>
            <span aria-hidden="true">←</span>
            <span>Volver a la lista de notas</span>
          </a>
        </>
      )}
    </div>
  )
}
