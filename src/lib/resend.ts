import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type EmailResult =
  | { data: { id: string }; error: null }
  | { data: null; error: Error }

export async function sendLoginAlertEmail(params: {
  to: string
  userAgent: string
  timestamp: string
}): Promise<EmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'notificaciones@expedientesclinicos.mx',
      to: params.to,
      subject: 'Alerta de seguridad: Inicio de sesión detectado',
      text: [
        'Se detectó un inicio de sesión en su cuenta del Sistema de Expedientes Clínicos.',
        '',
        `Fecha y hora: ${new Date(params.timestamp).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`,
        `Dispositivo: ${params.userAgent}`,
        '',
        'Si usted realizó este acceso, puede ignorar este mensaje.',
        'Si no reconoce esta actividad, cambie su contraseña de inmediato y contacte al administrador del sistema.',
        '',
        'Sistema de Expedientes Clínicos — Neuropsicología',
      ].join('\n'),
    })

    if (error) return { data: null, error: new Error(error.message) }
    return { data: { id: data?.id ?? '' }, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

export async function sendNotaLockedEmail(params: {
  to: string
  notaId: string
  pacienteId: string
  lockedAt: string
  hashIntegridad: string
}): Promise<EmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'notificaciones@expedientesclinicos.mx',
      to: params.to,
      subject: 'Nota de evolución bloqueada (NOM-004)',
      text: [
        'Se ha bloqueado una nota de evolución de forma permanente en el Sistema de Expedientes Clínicos.',
        '',
        `ID de nota: ${params.notaId}`,
        `ID de paciente: ${params.pacienteId}`,
        `Bloqueada el: ${new Date(params.lockedAt).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`,
        `Hash de integridad SHA-256: ${params.hashIntegridad}`,
        '',
        'Esta acción es irreversible conforme a la NOM-004-SSA3-2012 (inalterabilidad del expediente clínico).',
        '',
        'Sistema de Expedientes Clínicos — Neuropsicología',
      ].join('\n'),
    })

    if (error) return { data: null, error: new Error(error.message) }
    return { data: { id: data?.id ?? '' }, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}
