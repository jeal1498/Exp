import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/supabase/audit'
import { formatFecha } from '@/lib/format'
import { TIPO_BATERIA_LABEL, ESTADO_BATERIA_LABEL } from '@/lib/evaluaciones/constants'
import type { TipoBateria, EstadoBateria } from '@/lib/evaluaciones/constants'
import styles from '../pacientes.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Expediente — Expedientes Clínicos' }

export default async function PacienteDetallePage({
  params,
}: {
  params: Promise<{ pacienteId: string }>
}) {
  const { pacienteId } = await params
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const { data: paciente, error } = await supabase
    .from('pacientes')
    .select(
      'id, numero_expediente, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, curp, sexo, lateralidad, escolaridad, ocupacion, telefono, email, motivo_consulta, consentimiento_informado, consentimiento_fecha, created_at'
    )
    .eq('id', pacienteId)
    .eq('is_active', true)
    .single()

  const { data: ultimasBaterias } = await supabase
    .from('baterias_evaluacion')
    .select('id, tipo, estado, created_at, is_locked')
    .eq('paciente_id', pacienteId)
    .order('created_at', { ascending: false })
    .limit(3)

  await insertAuditLog(supabase, {
    usuario_id: userData.user.id,
    tabla_afectada: 'pacientes',
    registro_id: pacienteId,
    accion: 'SELECT',
    datos_nuevos: { vista: 'expediente' },
  })

  const nombrePaciente = paciente
    ? `${paciente.nombre} ${paciente.apellido_paterno} ${paciente.apellido_materno ?? ''}`.trim()
    : 'Expediente'

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
          <li className={styles.breadcrumbItem} aria-current="page">
            {nombrePaciente}
          </li>
        </ol>
      </nav>

      {(error || !paciente) && (
        <p role="alert" className={styles.alert}>
          Paciente no encontrado o sin acceso.
        </p>
      )}

      {paciente && (
        <>
          <h1 className={styles.pageTitle}>{nombrePaciente}</h1>

          <dl className={styles.metaList}>
            <dt className={styles.metaLabel}>No. Expediente</dt>
            <dd className={`${styles.metaValue} ${styles.metaValueMono}`}>
              {paciente.numero_expediente}
            </dd>

            <dt className={styles.metaLabel}>CURP</dt>
            <dd className={`${styles.metaValue} ${styles.metaValueMono}`}>
              {paciente.curp}
            </dd>

            <dt className={styles.metaLabel}>Fecha de nacimiento</dt>
            <dd className={styles.metaValue}>{formatFecha(paciente.fecha_nacimiento)}</dd>

            <dt className={styles.metaLabel}>Sexo</dt>
            <dd className={styles.metaValue}>{paciente.sexo}</dd>

            <dt className={styles.metaLabel}>Lateralidad</dt>
            <dd className={styles.metaValue}>{paciente.lateralidad ?? '—'}</dd>

            <dt className={styles.metaLabel}>Escolaridad</dt>
            <dd className={styles.metaValue}>{paciente.escolaridad ?? '—'}</dd>

            {paciente.ocupacion && (
              <>
                <dt className={styles.metaLabel}>Ocupación</dt>
                <dd className={styles.metaValue}>{paciente.ocupacion}</dd>
              </>
            )}

            {paciente.telefono && (
              <>
                <dt className={styles.metaLabel}>Teléfono</dt>
                <dd className={styles.metaValue}>{paciente.telefono}</dd>
              </>
            )}

            {paciente.email && (
              <>
                <dt className={styles.metaLabel}>Correo</dt>
                <dd className={styles.metaValue}>{paciente.email}</dd>
              </>
            )}

            {paciente.motivo_consulta && (
              <>
                <dt className={styles.metaLabel}>Motivo de consulta</dt>
                <dd className={styles.metaValue}>{paciente.motivo_consulta}</dd>
              </>
            )}

            <dt className={styles.metaLabel}>Consentimiento informado</dt>
            <dd className={styles.metaValue}>
              {paciente.consentimiento_informado
                ? `Sí — ${paciente.consentimiento_fecha ?? ''}`
                : 'No registrado'}
            </dd>

            <dt className={styles.metaLabel}>Registrado</dt>
            <dd className={styles.metaValue}>{formatFecha(paciente.created_at)}</dd>
          </dl>

          <hr className={styles.divider} />

          <h2 className={styles.sectionHeading}>Módulos del expediente</h2>
          <ul className={styles.moduleList}>
            <li className={styles.moduleItem}>
              <a
                href={`/dashboard/pacientes/${pacienteId}/baterias`}
                className={styles.moduleLink}
              >
                Baterías de Evaluación
              </a>
            </li>
            <li className={styles.moduleItem}>
              <a
                href={`/dashboard/pacientes/${pacienteId}/evaluaciones`}
                className={styles.moduleLink}
              >
                Evaluaciones Sueltas (legado)
              </a>
            </li>
            <li className={styles.moduleItem}>
              <a
                href={`/dashboard/pacientes/${pacienteId}/notas`}
                className={styles.moduleLink}
              >
                Notas de Evolución (SOAP)
              </a>
            </li>
            <li className={styles.moduleItem}>
              <a
                href={`/dashboard/pacientes/${pacienteId}/documentos`}
                className={styles.moduleLink}
              >
                Documentos Adjuntos
              </a>
            </li>
          </ul>

          {ultimasBaterias && ultimasBaterias.length > 0 && (
            <>
              <h2 className={styles.sectionHeading} style={{ marginTop: '1.5rem' }}>Últimas Baterías</h2>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col" className={styles.th}>Fecha</th>
                      <th scope="col" className={styles.th}>Tipo</th>
                      <th scope="col" className={styles.th}>Estado</th>
                      <th scope="col" className={styles.th}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimasBaterias.map(b => (
                      <tr key={b.id} className={styles.tr}>
                        <td className={styles.td}>{formatFecha(b.created_at)}</td>
                        <td className={styles.td}>{TIPO_BATERIA_LABEL[b.tipo as TipoBateria]}</td>
                        <td className={styles.td}>
                          {ESTADO_BATERIA_LABEL[b.estado as EstadoBateria]}
                          {b.is_locked && <span style={{ marginLeft: '6px', fontSize: '0.75rem', color: 'oklch(0.430 0.130 155)', fontWeight: 600 }}>🔒</span>}
                        </td>
                        <td className={`${styles.td} ${styles.actionsCell}`}>
                          <a href={`/dashboard/pacientes/${pacienteId}/baterias/${b.id}`} className={styles.tableLink}>Ver</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <a
                href={`/dashboard/pacientes/${pacienteId}/baterias`}
                className={styles.tableLink}
                style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.85rem' }}
              >
                Ver todas las baterías →
              </a>
            </>
          )}

          <a href="/dashboard/pacientes" className={styles.backLink}>
            <span aria-hidden="true">←</span>
            <span>Volver a la lista de pacientes</span>
          </a>
        </>
      )}
    </div>
  )
}
