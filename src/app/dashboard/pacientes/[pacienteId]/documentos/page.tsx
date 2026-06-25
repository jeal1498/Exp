import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listDocumentos, type BucketId } from '@/lib/storage'
import { subirDocumento, eliminarDocumento } from './actions'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'
import { formatFecha } from '@/lib/format'
import styles from '../../pacientes.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Documentos — Expedientes Clínicos' }

const BUCKETS: { id: BucketId; label: string }[] = [
  { id: 'reportes-escaneados', label: 'Reportes Escaneados' },
  { id: 'consentimientos-firmados', label: 'Consentimientos Firmados' },
]

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default async function DocumentosPage({
  params,
  searchParams,
}: {
  params: Promise<{ pacienteId: string }>
  searchParams: Promise<{ bucket?: string; error?: string }>
}) {
  const { pacienteId } = await params
  const { bucket: bucketParam, error } = await searchParams

  const activeBucket: BucketId =
    bucketParam === 'consentimientos-firmados'
      ? 'consentimientos-firmados'
      : 'reportes-escaneados'

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('id, nombre, apellido_paterno')
    .eq('id', pacienteId)
    .eq('is_active', true)
    .single()

  const { data: documentos } = await listDocumentos(activeBucket, userData.user.id, pacienteId)

  const subirBound = subirDocumento.bind(null, pacienteId, activeBucket)
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
            Documentos
          </li>
        </ol>
      </nav>

      <h1 className={styles.pageTitle}>Documentos Adjuntos</h1>

      {error && (
        <p role="alert" className={styles.alert}>
          {decodeURIComponent(error)}
        </p>
      )}

      <nav aria-label="Secciones de documentos" className={styles.bucketNav}>
        {BUCKETS.map((b) => (
          <a
            key={b.id}
            href={`/dashboard/pacientes/${pacienteId}/documentos?bucket=${b.id}`}
            className={`${styles.bucketTab} ${activeBucket === b.id ? styles.bucketTabActive : styles.bucketTabInactive}`}
            aria-current={activeBucket === b.id ? 'page' : undefined}
          >
            {b.label}
          </a>
        ))}
      </nav>

      <section className={styles.uploadSection}>
        <h2 className={styles.uploadLabel}>
          Subir documento
        </h2>
        <p className={styles.uploadHint}>
          {activeBucket === 'reportes-escaneados'
            ? 'PDF, JPEG, PNG, WEBP — máx. 20 MB'
            : 'PDF, JPEG, PNG — máx. 10 MB'}
        </p>
        <form action={subirBound} encType="multipart/form-data" className={styles.uploadRow}>
          <input
            type="file"
            name="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            required
          />
          <button type="submit" className={styles.btnPrimary}>Subir</button>
        </form>
      </section>

      <h2 className={styles.sectionHeading}>
        {BUCKETS.find((b) => b.id === activeBucket)?.label ?? ''} ({documentos?.length ?? 0})
      </h2>

      {!documentos || documentos.length === 0 ? (
        <p className={styles.empty}>No hay documentos en esta sección.</p>
      ) : (
        <div
          className={styles.tableWrapper}
          role="region"
          aria-labelledby="tabla-docs-titulo"
          tabIndex={0}
        >
          <span id="tabla-docs-titulo" className="sr-only">Lista de documentos adjuntos</span>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className={styles.th}>Archivo</th>
                <th scope="col" className={styles.th}>Tamaño</th>
                <th scope="col" className={styles.th}>Fecha</th>
                <th scope="col" className={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {documentos.map((doc) => {
                const eliminarBound = eliminarDocumento.bind(null, pacienteId, activeBucket, doc.path)
                const displayName = doc.name.replace(/^\d+-/, '')
                return (
                  <tr key={doc.path} className={styles.tr}>
                    <td className={styles.td}>{displayName}</td>
                    <td className={styles.td}>{formatBytes(doc.size)}</td>
                    <td className={styles.td}>
                      {doc.createdAt ? formatFecha(doc.createdAt) : '—'}
                    </td>
                    <td className={`${styles.td} ${styles.actionsCell}`}>
                      {doc.signedUrl && (
                        <a
                          href={doc.signedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.tableAction}
                        >
                          Descargar
                        </a>
                      )}
                      <ConfirmDeleteButton action={eliminarBound} fileName={displayName} />
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
