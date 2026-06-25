import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/supabase/audit'
import { formatFechaHora } from '@/lib/format'
import { generarInforme, firmarBateria } from './actions'
import { TIPO_BATERIA_LABEL } from '@/lib/evaluaciones/constants'
import type { TipoBateria } from '@/lib/evaluaciones/constants'
import styles from '../../../../../pacientes.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Informe Clínico — Expedientes Clínicos' }

export default async function InformePage({
  params,
  searchParams,
}: {
  params: Promise<{ pacienteId: string; bateriaId: string }>
  searchParams: Promise<{ error?: string; exito?: string; firmado?: string }>
}) {
  const { pacienteId, bateriaId } = await params
  const { error, exito, firmado: firmadoParam } = await searchParams
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const { data: bateria, error: bateriaError } = await supabase
    .from('baterias_evaluacion')
    .select('*')
    .eq('id', bateriaId)
    .eq('created_by', userData.user.id)
    .single()

  if (bateriaError || !bateria) redirect(`/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}`)

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('id, nombre, apellido_paterno')
    .eq('id', pacienteId)
    .single()

  const { data: detallesRaw } = await supabase
    .from('evaluacion_instrumento_detalle')
    .select('id, instrumento_id, informante, nombre_informante, fecha_aplicacion, estado, puntajes_estandar')
    .eq('bateria_id', bateriaId)

  const { data: catalogo } = await supabase
    .from('instrumentos_catalogo')
    .select('id, nombre_corto')

  const catalogoMap = Object.fromEntries((catalogo ?? []).map(i => [i.id, i.nombre_corto]))

  const total = (detallesRaw ?? []).length
  const todosPuntuados = total > 0 && (detallesRaw ?? []).every(
    d => d.estado === 'puntuado' || d.estado === 'revisado'
  )

  await insertAuditLog(supabase, {
    usuario_id: userData.user.id,
    tabla_afectada: 'baterias_evaluacion',
    registro_id: bateriaId,
    accion: 'SELECT',
    datos_nuevos: { seccion: 'informe' },
  })

  const nombrePaciente = paciente
    ? `${paciente.nombre} ${paciente.apellido_paterno}`
    : 'Paciente'

  const actionGenerar = generarInforme.bind(null, pacienteId, bateriaId)
  const actionFirmar = firmarBateria.bind(null, pacienteId, bateriaId)

  // Get signed URL for the PDF if it exists
  let pdfUrl: string | null = null
  if (bateria.informe_storage_path) {
    const { data: signed } = await supabase.storage
      .from('reportes-escaneados')
      .createSignedUrl(bateria.informe_storage_path, 3600)
    pdfUrl = signed?.signedUrl ?? null
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
          <li className={styles.breadcrumbItem}>
            <a href={`/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}`}>
              {TIPO_BATERIA_LABEL[bateria.tipo as TipoBateria]}
            </a>
          </li>
          <li className={styles.breadcrumbItem} aria-hidden="true">
            <span className={styles.breadcrumbSep}>›</span>
          </li>
          <li className={styles.breadcrumbItem} aria-current="page">Informe</li>
        </ol>
      </nav>

      <h1 className={styles.pageTitle}>Informe Clínico</h1>

      {error && (
        <p role="alert" className={styles.alert}>
          {decodeURIComponent(error)}
        </p>
      )}

      {(exito || firmadoParam) && (
        <p role="status" style={{
          padding: '0.75rem 1rem',
          background: 'oklch(0.920 0.080 155)',
          color: 'oklch(0.300 0.130 155)',
          borderRadius: '6px',
          marginBottom: '1.5rem',
          fontWeight: 500,
        }}>
          {firmadoParam ? '✓ Informe firmado y bloqueado exitosamente.' : '✓ Informe generado exitosamente.'}
        </p>
      )}

      {bateria.is_locked && (
        <div className={styles.alert} style={{
          background: 'oklch(0.920 0.080 155)',
          color: 'oklch(0.300 0.130 155)',
          borderColor: 'oklch(0.600 0.130 155)',
        }}>
          <p style={{ fontWeight: 700, marginBottom: '4px' }}>🔒 Informe firmado — NOM-004 art. 9</p>
          <p style={{ fontSize: '0.85rem' }}>
            Firmado el {bateria.locked_at ? formatFechaHora(bateria.locked_at) : '—'}
          </p>
          {bateria.hash_integridad && (
            <p className={styles.metaValueMono} style={{ fontSize: '0.75rem', marginTop: '4px', wordBreak: 'break-all' }}>
              SHA-256: {bateria.hash_integridad}
            </p>
          )}
        </div>
      )}

      {/* PDF viewer */}
      {pdfUrl && (
        <div style={{ marginBottom: '1.5rem' }}>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnPrimary}
            style={{ display: 'inline-block', marginBottom: '0.75rem' }}
          >
            Descargar PDF
          </a>
          {bateria.informe_generado_at && (
            <p style={{ fontSize: '0.8rem', color: 'oklch(0.500 0.000 0)' }}>
              Generado: {formatFechaHora(bateria.informe_generado_at)}
            </p>
          )}
        </div>
      )}

      {!bateria.is_locked && (
        <>
          {!todosPuntuados && (
            <p className={styles.alert}>
              Todos los instrumentos deben estar puntuados antes de generar el informe ({(detallesRaw ?? []).filter(d => d.estado === 'puntuado' || d.estado === 'revisado').length}/{total} completos).
            </p>
          )}

          <form action={actionGenerar} className={styles.form}>
            <fieldset className={styles.fieldset}>
              <legend>Contenido del informe</legend>

              <div className={styles.fieldGroup}>
                <label className={styles.labelFor} htmlFor="impresion_diagnostica">
                  Impresión diagnóstica
                  <span className={styles.labelHint}> (se incluirá en el PDF)</span>
                </label>
                <textarea
                  id="impresion_diagnostica"
                  name="impresion_diagnostica"
                  rows={6}
                  className={styles.textarea}
                  placeholder="Describa la impresión diagnóstica basada en los resultados de la evaluación..."
                  defaultValue={bateria.impresion_diagnostica ?? undefined}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.labelFor} htmlFor="recomendaciones">
                  Recomendaciones
                  <span className={styles.labelHint}> (se incluirá en el PDF)</span>
                </label>
                <textarea
                  id="recomendaciones"
                  name="recomendaciones"
                  rows={6}
                  className={styles.textarea}
                  placeholder="Liste las recomendaciones para el paciente, familia y/o escuela..."
                  defaultValue={bateria.recomendaciones ?? undefined}
                />
              </div>
            </fieldset>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={!todosPuntuados}
              >
                {bateria.informe_storage_path ? 'Regenerar PDF' : 'Generar PDF'}
              </button>
            </div>
          </form>

          {bateria.informe_storage_path && (
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid oklch(0.900 0.000 0)' }}>
              <h2 className={styles.sectionHeading}>Firmar el informe</h2>
              <p style={{ fontSize: '0.9rem', color: 'oklch(0.450 0.000 0)', marginBottom: '1rem' }}>
                Al firmar, el informe quedará bloqueado permanentemente (NOM-004 art. 9). Esta acción no se puede deshacer.
              </p>
              <form action={actionFirmar}>
                <button type="submit" className={styles.btnPrimary} style={{ background: 'oklch(0.430 0.130 155)' }}>
                  Firmar y bloquear informe
                </button>
              </form>
            </div>
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
