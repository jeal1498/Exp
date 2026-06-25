'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/supabase/audit'

export async function actualizarBorrador(
  bateriaId: string,
  pacienteId: string,
  formData: FormData
): Promise<never> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const impresion_diagnostica = (formData.get('impresion_diagnostica') as string || '').trim() || null
  const recomendaciones = (formData.get('recomendaciones') as string || '').trim() || null

  const { error } = await supabase
    .from('baterias_evaluacion')
    .update({
      impresion_diagnostica,
      recomendaciones,
      estado: 'borrador_informe',
    })
    .eq('id', bateriaId)

  if (error) {
    redirect(
      `/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}/informe?error=${encodeURIComponent('Error al guardar el borrador: ' + error.message)}`
    )
  }

  await insertAuditLog(supabase, {
    usuario_id:     userData.user.id,
    tabla_afectada: 'baterias_evaluacion',
    registro_id:    bateriaId,
    accion:         'UPDATE',
    datos_nuevos:   { estado: 'borrador_informe', paciente_id: pacienteId },
  })

  redirect(`/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}/informe`)
}

export async function generarInforme(
  bateriaId: string,
  pacienteId: string
): Promise<never> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const errorUrl = `/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}/informe?error=`

  const { data: bateria } = await supabase
    .from('baterias_evaluacion')
    .select('id, tipo, motivo_consulta, impresion_diagnostica, recomendaciones, is_locked')
    .eq('id', bateriaId)
    .single()

  if (!bateria) {
    redirect(`${errorUrl}${encodeURIComponent('Batería no encontrada')}`)
  }

  if (bateria.is_locked) {
    redirect(`${errorUrl}${encodeURIComponent('La batería ya está firmada y no se puede modificar')}`)
  }

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, escolaridad')
    .eq('id', pacienteId)
    .single()

  if (!paciente) {
    redirect(`${errorUrl}${encodeURIComponent('Paciente no encontrado')}`)
  }

  const { data: detalles } = await supabase
    .from('evaluacion_instrumento_detalle')
    .select('instrumento_id, informante, nombre_informante, fecha_aplicacion, puntajes_brutos, instrumentos_catalogo(nombre_corto)')
    .eq('bateria_id', bateriaId)
    .in('estado', ['puntuado', 'revisado'])

  // Dynamic import to avoid breaking the module if @react-pdf/renderer is not installed
  let pdfBuffer: Buffer
  try {
    const { renderToBuffer } = await import('@react-pdf/renderer')
    const { InformeNeuropsicologico } = await import('@/lib/pdf/InformeNeuropsicologico')
    const React = await import('react')

    const instrumentosConDatos = (detalles ?? []).map(d => ({
      nombre_corto: (d.instrumentos_catalogo as { nombre_corto: string } | null)?.nombre_corto ?? d.instrumento_id,
      informante: d.informante,
      nombre_informante: d.nombre_informante,
      fecha_aplicacion: d.fecha_aplicacion,
      puntajes_brutos: (d.puntajes_brutos ?? {}) as Record<string, unknown>,
    }))

    const fechaInforme = new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfBuffer = await renderToBuffer(React.createElement(InformeNeuropsicologico, {
      paciente,
      bateria,
      instrumentos: instrumentosConDatos,
      fechaInforme,
    }) as any)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    redirect(`${errorUrl}${encodeURIComponent('Error al generar el PDF: ' + msg)}`)
  }

  const { uploadDocumento } = await import('@/lib/storage')
  const file = new File([new Uint8Array(pdfBuffer)], `informe-${bateriaId}.pdf`, { type: 'application/pdf' })
  const storageResult = await uploadDocumento('reportes-escaneados', userData.user.id, pacienteId, file)

  if (!storageResult.data) {
    redirect(`${errorUrl}${encodeURIComponent('Error al subir el informe a almacenamiento')}`)
  }

  const { error: updateError } = await supabase
    .from('baterias_evaluacion')
    .update({
      informe_storage_path: storageResult.data.path,
      informe_generado_at: new Date().toISOString(),
      estado: 'borrador_informe',
    })
    .eq('id', bateriaId)

  if (updateError) {
    redirect(`${errorUrl}${encodeURIComponent('Error al registrar el informe: ' + updateError.message)}`)
  }

  await insertAuditLog(supabase, {
    usuario_id:     userData.user.id,
    tabla_afectada: 'baterias_evaluacion',
    registro_id:    bateriaId,
    accion:         'UPDATE',
    datos_nuevos:   { estado: 'borrador_informe', informe_generado: true },
  })

  redirect(`/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}/informe`)
}

export async function firmarBateria(bateriaId: string, pacienteId: string): Promise<never> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const errorUrl = `/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}/informe?error=`

  const { data: bateria } = await supabase
    .from('baterias_evaluacion')
    .select('id, is_locked, impresion_diagnostica, recomendaciones, evaluacion_instrumento_detalle(instrumento_id, informante, puntajes_brutos)')
    .eq('id', bateriaId)
    .single()

  if (!bateria) {
    redirect(`${errorUrl}${encodeURIComponent('Batería no encontrada')}`)
  }

  if (bateria.is_locked) {
    redirect(`${errorUrl}${encodeURIComponent('La batería ya está firmada')}`)
  }

  const contenidoHash = JSON.stringify({
    bateria_id: bateriaId,
    impresion_diagnostica: bateria.impresion_diagnostica,
    recomendaciones: bateria.recomendaciones,
    instrumentos: bateria.evaluacion_instrumento_detalle?.map((d: { instrumento_id: string; informante: string; puntajes_brutos: unknown }) => ({
      instrumento_id: d.instrumento_id,
      informante: d.informante,
      puntajes_brutos: d.puntajes_brutos,
    })),
  })

  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(contenidoHash))
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  const { error } = await supabase
    .from('baterias_evaluacion')
    .update({
      is_locked:         true,
      locked_at:         new Date().toISOString(),
      hash_integridad:   hashHex,
      estado:            'firmado',
      estado_updated_at: new Date().toISOString(),
    })
    .eq('id', bateriaId)

  if (error) {
    redirect(`${errorUrl}${encodeURIComponent('Error al firmar la batería: ' + error.message)}`)
  }

  await insertAuditLog(supabase, {
    usuario_id:     userData.user.id,
    tabla_afectada: 'baterias_evaluacion',
    registro_id:    bateriaId,
    accion:         'UPDATE',
    datos_nuevos:   { estado: 'firmado', is_locked: true, hash_integridad: hashHex },
  })

  redirect(`/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}/informe`)
}
