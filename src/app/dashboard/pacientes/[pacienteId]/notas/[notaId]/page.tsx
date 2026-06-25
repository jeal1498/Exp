import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { bloquearNota } from './actions'
import { insertAuditLog } from '@/lib/supabase/audit'
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
      <p style={{ fontSize: '0.85em', color: '#555' }}>
        <a href="/dashboard/pacientes">Pacientes</a>
        {' › '}
        <a href={`/dashboard/pacientes/${pacienteId}`}>{nombrePaciente}</a>
        {' › '}
        <a href={`/dashboard/pacientes/${pacienteId}/notas`}>Notas de Evolución</a>
        {' › Nota'}
      </p>

      {sp.error && (
        <p role="alert" style={{ color: 'red', border: '1px solid red', padding: '8px' }}>
          {decodeURIComponent(sp.error)}
        </p>
      )}

      {(error || !nota) && (
        <p role="alert" style={{ color: 'red', border: '1px solid red', padding: '8px' }}>
          Nota no encontrada o sin acceso.
        </p>
      )}

      {nota && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1>Nota de Evolución</h1>
            {nota.is_locked ? (
              <span
                style={{
                  background: '#fee',
                  color: 'red',
                  border: '1px solid red',
                  padding: '2px 8px',
                  fontWeight: 'bold',
                  fontSize: '0.9em',
                }}
              >
                BLOQUEADA — NOM-004 Art. 9
              </span>
            ) : (
              <span
                style={{
                  background: '#efe',
                  color: 'green',
                  border: '1px solid green',
                  padding: '2px 8px',
                  fontSize: '0.9em',
                }}
              >
                BORRADOR
              </span>
            )}
          </div>

          <dl style={{ lineHeight: '1.8' }}>
            <dt><strong>Fecha de la nota</strong></dt>
            <dd>{new Date(nota.fecha_nota).toLocaleString('es-MX')}</dd>

            {nota.codigo_cie11 && (
              <>
                <dt><strong>Código CIE-11</strong></dt>
                <dd><code>{nota.codigo_cie11}</code></dd>
              </>
            )}

            {nota.descripcion_cie11 && (
              <>
                <dt><strong>Diagnóstico</strong></dt>
                <dd>{nota.descripcion_cie11}</dd>
              </>
            )}
          </dl>

          <hr />

          <h2>Nota SOAP</h2>

          <section style={{ marginBottom: '16px' }}>
            <h3>S — Subjetivo</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{nota.subjetivo ?? <em>No registrado</em>}</p>
          </section>

          <section style={{ marginBottom: '16px' }}>
            <h3>O — Objetivo</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{nota.objetivo ?? <em>No registrado</em>}</p>
          </section>

          <section style={{ marginBottom: '16px' }}>
            <h3>A — Análisis</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{nota.analisis ?? <em>No registrado</em>}</p>
          </section>

          <section style={{ marginBottom: '16px' }}>
            <h3>P — Plan</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{nota.plan ?? <em>No registrado</em>}</p>
          </section>

          <hr />

          <h2>Inalterabilidad (NOM-004 Art. 9 / NOM-024)</h2>

          {nota.is_locked ? (
            <dl style={{ lineHeight: '1.8' }}>
              <dt><strong>Bloqueada el</strong></dt>
              <dd>{new Date(nota.locked_at!).toLocaleString('es-MX')}</dd>

              <dt><strong>Hash de integridad SHA-256 (NOM-024)</strong></dt>
              <dd>
                <code
                  style={{
                    display: 'block',
                    wordBreak: 'break-all',
                    background: '#f5f5f5',
                    padding: '8px',
                    fontSize: '0.85em',
                  }}
                >
                  {nota.hash_integridad}
                </code>
              </dd>
            </dl>
          ) : (
            <div>
              <p style={{ color: '#555', fontSize: '0.9em' }}>
                Una vez bloqueada, la nota no puede modificarse (NOM-004 Art. 9).
                El sistema generará un hash SHA-256 del contenido para garantizar su integridad (NOM-024).
              </p>
              <form action={bloquearNotaBound}>
                <button
                  type="submit"
                  style={{
                    background: '#c00',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    cursor: 'pointer',
                  }}
                >
                  Bloquear Nota (acción irreversible)
                </button>
              </form>
            </div>
          )}

          <hr />

          <dl style={{ lineHeight: '1.8', fontSize: '0.85em', color: '#555' }}>
            <dt><strong>Creada</strong></dt>
            <dd>{new Date(nota.created_at).toLocaleString('es-MX')}</dd>

            <dt><strong>Última modificación</strong></dt>
            <dd>{new Date(nota.updated_at).toLocaleString('es-MX')}</dd>
          </dl>

          <p style={{ marginTop: '16px' }}>
            <a href={`/dashboard/pacientes/${pacienteId}/notas`}>← Volver a la lista de notas</a>
          </p>
        </>
      )}
    </div>
  )
}
