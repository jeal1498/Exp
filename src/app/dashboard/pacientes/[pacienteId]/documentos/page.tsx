import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listDocumentos, type BucketId } from '@/lib/storage'
import { subirDocumento, eliminarDocumento } from './actions'
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
    .select('nombre, apellido_paterno')
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
      <p style={{ fontSize: '0.85em', color: '#555' }}>
        <a href="/dashboard/pacientes">Pacientes</a>
        {' › '}
        <a href={`/dashboard/pacientes/${pacienteId}`}>{nombrePaciente}</a>
        {' › '}
        Documentos
      </p>

      <h1>Documentos Adjuntos</h1>

      {error && (
        <p role="alert" style={{ color: 'red', border: '1px solid red', padding: '8px' }}>
          {decodeURIComponent(error)}
        </p>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {BUCKETS.map((b) => (
          <a
            key={b.id}
            href={`/dashboard/pacientes/${pacienteId}/documentos?bucket=${b.id}`}
            style={{
              padding: '6px 14px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              textDecoration: 'none',
              backgroundColor: activeBucket === b.id ? '#0070f3' : '#fff',
              color: activeBucket === b.id ? '#fff' : '#000',
            }}
          >
            {b.label}
          </a>
        ))}
      </div>

      <h2 style={{ fontSize: '1em', marginBottom: '8px' }}>
        Subir documento ({activeBucket === 'reportes-escaneados' ? 'PDF, JPEG, PNG, WEBP — máx. 20 MB' : 'PDF, JPEG, PNG — máx. 10 MB'})
      </h2>
      <form action={subirBound} encType="multipart/form-data" style={{ marginBottom: '24px' }}>
        <input
          type="file"
          name="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          required
          style={{ marginRight: '8px' }}
        />
        <button type="submit" style={{ padding: '6px 14px' }}>
          Subir
        </button>
      </form>

      <h2 style={{ fontSize: '1em', marginBottom: '8px' }}>
        {BUCKETS.find((b) => b.id === activeBucket)?.label ?? ''} ({documentos?.length ?? 0})
      </h2>

      {!documentos || documentos.length === 0 ? (
        <p style={{ color: '#777' }}>No hay documentos en esta sección.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
              <th style={{ padding: '6px 8px' }}>Archivo</th>
              <th style={{ padding: '6px 8px' }}>Tamaño</th>
              <th style={{ padding: '6px 8px' }}>Fecha</th>
              <th style={{ padding: '6px 8px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {documentos.map((doc) => {
              const eliminarBound = eliminarDocumento.bind(null, pacienteId, activeBucket, doc.path)
              const displayName = doc.name.replace(/^\d+-/, '')
              return (
                <tr key={doc.path} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '6px 8px' }}>{displayName}</td>
                  <td style={{ padding: '6px 8px' }}>{formatBytes(doc.size)}</td>
                  <td style={{ padding: '6px 8px' }}>
                    {doc.createdAt
                      ? new Date(doc.createdAt).toLocaleDateString('es-MX')
                      : '—'}
                  </td>
                  <td style={{ padding: '6px 8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {doc.signedUrl && (
                      <a
                        href={doc.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#0070f3' }}
                      >
                        Descargar
                      </a>
                    )}
                    <form action={eliminarBound}>
                      <button
                        type="submit"
                        style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        onClick={(e) => {
                          if (!confirm(`¿Eliminar "${displayName}"? Esta acción no se puede deshacer.`)) {
                            e.preventDefault()
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      <p style={{ marginTop: '24px' }}>
        <a href={`/dashboard/pacientes/${pacienteId}`}>← Volver al expediente</a>
      </p>
    </div>
  )
}
