import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatFecha } from '@/lib/format'
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
      'id, numero_expediente, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, curp, sexo, lateralidad, lugar_nacimiento, estado_civil, escolaridad, ocupacion, telefono, email, motivo_consulta, consentimiento_informado, consentimiento_fecha, tutor_nombre, tutor_relacion, tutor_telefono, created_at'
    )
    .eq('id', pacienteId)
    .eq('is_active', true)
    .single()

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

            {paciente.lugar_nacimiento && (
              <>
                <dt className={styles.metaLabel}>Lugar de nacimiento</dt>
                <dd className={styles.metaValue}>{paciente.lugar_nacimiento}</dd>
              </>
            )}

            {paciente.estado_civil && (
              <>
                <dt className={styles.metaLabel}>Estado civil</dt>
                <dd className={styles.metaValue}>{paciente.estado_civil}</dd>
              </>
            )}

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

            {paciente.tutor_nombre && (
              <>
                <dt className={styles.metaLabel}>Tutor / Responsable</dt>
                <dd className={styles.metaValue}>
                  {paciente.tutor_nombre}
                  {paciente.tutor_relacion ? ` (${paciente.tutor_relacion})` : ''}
                  {paciente.tutor_telefono ? ` — ${paciente.tutor_telefono}` : ''}
                </dd>
              </>
            )}

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
                Evaluaciones Neuropsicológicas
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
            <li className={styles.moduleItem}>
              <a
                href={`/dashboard/pacientes/${pacienteId}/expediente`}
                className={styles.moduleLink}
              >
                Expediente Completo PDF
              </a>
            </li>
          </ul>

          <a href="/dashboard/pacientes" className={styles.backLink}>
            <span aria-hidden="true">←</span>
            <span>Volver a la lista de pacientes</span>
          </a>
        </>
      )}
    </div>
  )
}
