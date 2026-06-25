'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import { InformeNeuropsicologico } from '@/lib/pdf/InformeNeuropsicologico'
import { createElement } from 'react'
import type { ReactElement, JSXElementConstructor } from 'react'
import { createHash } from 'crypto'

export async function generarInforme(pacienteId: string, bateriaId: string, formData: FormData): Promise<never> {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const errorBase = `/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}/informe`

  const impresion_diagnostica = (formData.get('impresion_diagnostica') as string || '').trim() || null
  const recomendaciones = (formData.get('recomendaciones') as string || '').trim() || null

  // Save impresion + recomendaciones first
  await supabase.from('baterias_evaluacion').update({
    impresion_diagnostica,
    recomendaciones,
  }).eq('id', bateriaId)

  const { data: bateria } = await supabase
    .from('baterias_evaluacion')
    .select('*')
    .eq('id', bateriaId)
    .single()

  if (!bateria) redirect(`${errorBase}?error=${encodeURIComponent('Batería no encontrada')}`)

  if (bateria.is_locked) {
    redirect(`${errorBase}?error=${encodeURIComponent('La batería está firmada y bloqueada')}`)
  }

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, escolaridad, numero_expediente')
    .eq('id', pacienteId)
    .single()

  if (!paciente) redirect(`${errorBase}?error=${encodeURIComponent('Paciente no encontrado')}`)

  const { data: detallesRaw } = await supabase
    .from('evaluacion_instrumento_detalle')
    .select('id, instrumento_id, informante, nombre_informante, fecha_aplicacion, puntajes_estandar')
    .eq('bateria_id', bateriaId)
    .in('estado', ['puntuado', 'revisado'])

  const { data: catalogo } = await supabase
    .from('instrumentos_catalogo')
    .select('id, codigo, nombre_corto')

  const catalogoMap = Object.fromEntries((catalogo ?? []).map(i => [i.id, i]))

  const detalles = (detallesRaw ?? []).map(d => ({
    ...d,
    instrumento_nombre: catalogoMap[d.instrumento_id]?.nombre_corto ?? 'Instrumento',
    instrumento_codigo: catalogoMap[d.instrumento_id]?.codigo ?? '',
  }))

  const updatedBateria = { ...bateria, impresion_diagnostica, recomendaciones }

  const pdfBuffer = await renderToBuffer(
    createElement(InformeNeuropsicologico, {
      bateria: updatedBateria,
      paciente,
      detalles,
      firmado: false,
    }) as ReactElement<DocumentProps, string | JSXElementConstructor<unknown>>
  )

  const timestamp = Date.now()
  const storagePath = `${userData.user.id}/${pacienteId}/informe-${bateriaId}-${timestamp}.pdf`

  const { error: uploadError } = await supabase.storage
    .from('reportes-escaneados')
    .upload(storagePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadError) {
    redirect(`${errorBase}?error=${encodeURIComponent('Error al subir el PDF: ' + uploadError.message)}`)
  }

  await supabase.from('baterias_evaluacion').update({
    informe_storage_path: storagePath,
    informe_generado_at: new Date().toISOString(),
    estado: 'borrador_informe',
  }).eq('id', bateriaId)

  redirect(`${errorBase}?exito=1`)
}

export async function firmarBateria(pacienteId: string, bateriaId: string, _formData: FormData): Promise<never> {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const errorBase = `/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}/informe`

  const { data: bateria } = await supabase
    .from('baterias_evaluacion')
    .select('*')
    .eq('id', bateriaId)
    .eq('is_locked', false)
    .single()

  if (!bateria) {
    redirect(`${errorBase}?error=${encodeURIComponent('La batería no existe o ya está firmada')}`)
  }

  const { data: detallesRaw } = await supabase
    .from('evaluacion_instrumento_detalle')
    .select('id, instrumento_id, informante, nombre_informante, fecha_aplicacion, puntajes_estandar')
    .eq('bateria_id', bateriaId)
    .in('estado', ['puntuado', 'revisado'])

  // Calculate SHA-256 hash over all scored puntajes_estandar
  const hashContent = JSON.stringify({
    bateria_id: bateriaId,
    paciente_id: pacienteId,
    tipo: bateria.tipo,
    motivo_consulta: bateria.motivo_consulta,
    impresion_diagnostica: bateria.impresion_diagnostica,
    recomendaciones: bateria.recomendaciones,
    created_at: bateria.created_at,
    detalles: (detallesRaw ?? []).map(d => ({
      id: d.id,
      instrumento_id: d.instrumento_id,
      informante: d.informante,
      puntajes_estandar: d.puntajes_estandar,
    })),
  })
  const hash = createHash('sha256').update(hashContent, 'utf8').digest('hex')

  const lockedAt = new Date().toISOString()

  const { error: lockError } = await supabase
    .from('baterias_evaluacion')
    .update({
      is_locked: true,
      locked_at: lockedAt,
      hash_integridad: hash,
      estado: 'firmado',
    })
    .eq('id', bateriaId)
    .eq('is_locked', false)

  if (lockError) {
    redirect(`${errorBase}?error=${encodeURIComponent('Error al firmar: ' + lockError.message)}`)
  }

  // Re-generate PDF with FIRMADO watermark
  const { data: paciente } = await supabase
    .from('pacientes')
    .select('nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, escolaridad, numero_expediente')
    .eq('id', pacienteId)
    .single()

  const { data: catalogo } = await supabase
    .from('instrumentos_catalogo')
    .select('id, codigo, nombre_corto')

  const catalogoMap = Object.fromEntries((catalogo ?? []).map(i => [i.id, i]))

  const detalles = (detallesRaw ?? []).map(d => ({
    ...d,
    instrumento_nombre: catalogoMap[d.instrumento_id]?.nombre_corto ?? 'Instrumento',
    instrumento_codigo: catalogoMap[d.instrumento_id]?.codigo ?? '',
  }))

  if (paciente) {
    const firmadoBateria = {
      ...bateria,
      is_locked: true,
      locked_at: lockedAt,
      hash_integridad: hash,
    }

    const pdfBuffer = await renderToBuffer(
      createElement(InformeNeuropsicologico, {
        bateria: firmadoBateria,
        paciente,
        detalles,
        firmado: true,
      }) as ReactElement<DocumentProps, string | JSXElementConstructor<unknown>>
    )

    const storagePath = bateria.informe_storage_path ??
      `${userData.user.id}/${pacienteId}/informe-${bateriaId}-firmado.pdf`

    await supabase.storage
      .from('reportes-escaneados')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (!bateria.informe_storage_path) {
      await supabase.from('baterias_evaluacion').update({
        informe_storage_path: storagePath,
        informe_generado_at: lockedAt,
      }).eq('id', bateriaId)
    }
  }

  redirect(`${errorBase}?firmado=1`)
}
