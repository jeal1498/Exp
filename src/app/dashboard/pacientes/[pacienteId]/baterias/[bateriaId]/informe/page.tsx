import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/supabase/audit'
import { formatFecha, formatFechaHora } from '@/lib/format'
import { actualizarBorrador, firmarBateria, generarInforme } from './actions'
import { listDocumentos } from '@/lib/storage'
import styles from '../../../../pacientes.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Informe de Evaluación — Expedientes Clínicos' }

const TIPO_LABELS: Record<string, string> = {
  tdah_nino:    'TDAH Infantil',
  tdah_adulto:  'TDAH Adulto',
  tea:          'TEA / Autismo',
  personalizada: 'Personalizada',
}

export default async function InformePage({
  params,
  searchParams,
}: {
  params: Promise<{ pacienteId: string; bateriaId: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { pacienteId, bateriaId } = await params
  const { error } = await searchParams
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('id, nombre, apellido_paterno')
    .eq('id', pacienteId)
    .eq('is_active', true)
    .single()

  const { data: bateria } = await supabase
    .from('baterias_evaluacion')
    .select('id, tipo, estado, is_locked, locked_at, hash_integridad, impresion_diagnostica, recomendaciones, informe_storage_path, informe_generado_at, created_at')
    .eq('id', bateriaId)
    .single()

  await insertAuditLog(supabase, {
    usuario_id:     userData.user.id,
    tabla_afectada: 'baterias_evaluacion',
    registro_id:    bateriaId,
    accion:         'SELECT',
    datos_nuevos:   { paciente_id: pacienteId, sección: 'informe' },
  })

  const nombrePaciente = paciente
    ? `${paciente.nombre} ${paciente.apellido_paterno}`
    : 'Paciente'

  // Get signed URL for the PDF if it exists
  let pdfUrl: string | null = null
  if (bateria?.informe_storage_path) {
    const docs = await listDocumentos('reportes-escaneados', userData.user.id, pacienteId)
    const doc = docs.data?.find(d => d.path === bateria.informe_storage_path)
    pdfUrl = doc?.signedUrl ?? null
  }

  const actualizarAction = bateria ? actualizarBorrador.bind(null, bateriaId, pacienteId) : null
  const firmarAction = bateria ? firmarBateria.bind(null, bateriaId, pacienteId) : null
  const generarAction = bateria ? generarInforme.bind(null, bateriaId, pacienteId) : null

  const isLocked = bateria?.is_locked ?? false

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
          <li className={styles.breadcrumbItem}>
            <a href={`/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}`}>
              {bateria ? (TIPO_LABELS[bateria.tipo] ?? bateria.tipo) : 'Batería'}
            </a>
          </li>
          <li className={styles.breadcrumbItem} aria-hidden="true">
            <span className={styles.breadcrumbSep}>›</span>
          </li>
          <li className={styles.breadcrumbItem} aria-current="page">
            Informe
          </li>
        </ol>
      </nav>

      <h1 className={styles.pageTitle}>Informe de Evaluación Neuropsicológica</h1>

      {error && (
        <p role="alert" className={styles.alert}>
          {decodeURIComponent(error)}
        </p>
      )}

      {!bateria && (
        <p role="alert" className={styles.alert}>Batería no encontrada.</p>
      )}

      {bateria && (
        <>
          {isLocked && (
            <dl className={styles.metaList}>
              <dt className={styles.metaLabel}>Estado</dt>
              <dd className={styles.metaValue}>
                <span className={`${styles.badge} ${styles.badgeLocked}`}>Firmado</span>
              </dd>
              {bateria.locked_at && (
                <>
                  <dt className={styles.metaLabel}>Fecha de firma</dt>
                  <dd className={`${styles.metaValue} ${styles.metaValueMono}`}>
                    {formatFechaHora(bateria.locked_at)}
                  </dd>
                </>
              )}
              {bateria.hash_integridad && (
                <>
                  <dt className={styles.metaLabel}>Hash SHA-256</dt>
                  <dd className={`${styles.metaValue} ${styles.metaValueMono}`} style={{ fontSize: '0.75em', wordBreak: 'break-all' }}>
                    {bateria.hash_integridad}
                  </dd>
                </>
              )}
              {bateria.informe_generado_at && (
                <>
                  <dt className={styles.metaLabel}>PDF generado</dt>
                  <dd className={styles.metaValue}>{formatFecha(bateria.informe_generado_at)}</dd>
                </>
              )}
            </dl>
          )}

          {pdfUrl && (
            <div className={styles.formActions}>
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
                Descargar PDF del informe
              </a>
            </div>
          )}

          <hr className={styles.divider} />

          <h2 className={styles.sectionHeading}>Impresión diagnóstica</h2>

          {isLocked ? (
            <div className={styles.metaValue} style={{ whiteSpace: 'pre-wrap' }}>
              {bateria.impresion_diagnostica ?? '—'}
            </div>
          ) : (
            <form action={actualizarAction!} className={styles.form}>
              <fieldset className={styles.fieldset}>
                <legend>Redacción del informe</legend>

                <div className={styles.fieldGroup}>
                  <label className={styles.labelFor} htmlFor="impresion_diagnostica">
                    Impresión diagnóstica
                  </label>
                  <textarea
                    id="impresion_diagnostica"
                    name="impresion_diagnostica"
                    rows={8}
                    defaultValue={bateria.impresion_diagnostica ?? ''}
                    className={styles.textarea}
                    placeholder="Síntesis diagnóstica y hallazgos principales de la evaluación…"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.labelFor} htmlFor="recomendaciones">
                    Recomendaciones
                  </label>
                  <textarea
                    id="recomendaciones"
                    name="recomendaciones"
                    rows={6}
                    defaultValue={bateria.recomendaciones ?? ''}
                    className={styles.textarea}
                    placeholder="Recomendaciones de tratamiento, intervención o derivación…"
                  />
                </div>
              </fieldset>

              <div className={styles.formActions}>
                <button type="submit" className={styles.btnPrimary}>Guardar borrador</button>
              </div>
            </form>
          )}

          {isLocked && bateria.recomendaciones && (
            <>
              <h2 className={styles.sectionHeading}>Recomendaciones</h2>
              <div className={styles.metaValue} style={{ whiteSpace: 'pre-wrap' }}>
                {bateria.recomendaciones}
              </div>
            </>
          )}

          {!isLocked && (
            <>
              <hr className={styles.divider} />
              <h2 className={styles.sectionHeading}>Generar y firmar informe</h2>

              <p className={styles.metaValue}>
                Una vez guardado el borrador, puede generar el PDF del informe.
                Al firmarlo, la batería quedará inmutable (NOM-004-SSA3-2012 Art. 9).
              </p>

              <div className={styles.formActions}>
                <form action={generarAction!} style={{ display: 'inline' }}>
                  <button type="submit" className={styles.btnGhost}>
                    Generar PDF del informe
                  </button>
                </form>

                {bateria.informe_storage_path && (
                  <form action={firmarAction!} style={{ display: 'inline' }}>
                    <button type="submit" className={styles.btnPrimary}>
                      Firmar y bloquear batería
                    </button>
                  </form>
                )}
              </div>

              {bateria.informe_storage_path && !bateria.informe_generado_at && (
                <p className={styles.empty}>Informe PDF listo para firmar.</p>
              )}
            </>
          )}
        </>
      )}

      <a href={`/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}`} className={styles.backLink}>
        <span aria-hidden="true">←</span>
        <span>Volver a la batería</span>
      </a>
    </div>
  )
}
