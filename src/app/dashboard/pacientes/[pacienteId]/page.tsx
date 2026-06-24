import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
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

  return (
    <div>
      <p style={{ fontSize: '0.85em', color: '#555' }}>
        <a href="/dashboard/pacientes">Pacientes</a>
        {' › '}
        {paciente ? `${paciente.nombre} ${paciente.apellido_paterno}` : 'Expediente'}
      </p>

      {(error || !paciente) && (
        <p role="alert" style={{ color: 'red', border: '1px solid red', padding: '8px' }}>
          Paciente no encontrado o sin acceso.
        </p>
      )}

      {paciente && (
        <>
          <h1>
            Expediente: {paciente.nombre} {paciente.apellido_paterno}{' '}
            {paciente.apellido_materno ?? ''}
          </h1>

          <dl style={{ lineHeight: '1.8' }}>
            <dt><strong>No. Expediente</strong></dt>
            <dd>{paciente.numero_expediente}</dd>

            <dt><strong>CURP</strong></dt>
            <dd><code>{paciente.curp}</code></dd>

            <dt><strong>Fecha de nacimiento</strong></dt>
            <dd>{paciente.fecha_nacimiento}</dd>

            <dt><strong>Sexo</strong></dt>
            <dd>{paciente.sexo}</dd>

            <dt><strong>Lateralidad</strong></dt>
            <dd>{paciente.lateralidad ?? '—'}</dd>

            <dt><strong>Escolaridad</strong></dt>
            <dd>{paciente.escolaridad ?? '—'}</dd>

            {paciente.ocupacion && (
              <>
                <dt><strong>Ocupación</strong></dt>
                <dd>{paciente.ocupacion}</dd>
              </>
            )}

            {paciente.telefono && (
              <>
                <dt><strong>Teléfono</strong></dt>
                <dd>{paciente.telefono}</dd>
              </>
            )}

            {paciente.email && (
              <>
                <dt><strong>Correo</strong></dt>
                <dd>{paciente.email}</dd>
              </>
            )}

            {paciente.motivo_consulta && (
              <>
                <dt><strong>Motivo de consulta</strong></dt>
                <dd>{paciente.motivo_consulta}</dd>
              </>
            )}

            <dt><strong>Consentimiento informado</strong></dt>
            <dd>
              {paciente.consentimiento_informado
                ? `Sí — ${paciente.consentimiento_fecha ?? ''}`
                : 'No registrado'}
            </dd>

            <dt><strong>Registrado</strong></dt>
            <dd>{new Date(paciente.created_at).toLocaleDateString('es-MX')}</dd>
          </dl>

          <hr />

          <h2>Módulos del expediente</h2>
          <ul>
            <li>
              <a href={`/dashboard/pacientes/${pacienteId}/evaluaciones`}>
                Evaluaciones Neuropsicológicas
              </a>
            </li>
            <li>
              <a href={`/dashboard/pacientes/${pacienteId}/notas`}>
                Notas de Evolución (SOAP)
              </a>
            </li>
          </ul>

          <p style={{ marginTop: '16px' }}>
            <a href="/dashboard/pacientes">← Volver a la lista de pacientes</a>
          </p>
        </>
      )}
    </div>
  )
}
