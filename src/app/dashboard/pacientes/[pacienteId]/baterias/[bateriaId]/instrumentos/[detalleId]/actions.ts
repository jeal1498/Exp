'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/supabase/audit'
import { ADOS2_PUNTOS_CORTE } from '@/lib/evaluaciones/constants'

function buildPuntajesBrutos(codigo: string, formData: FormData): Record<string, unknown> {
  if (codigo === 'CONNERS3') {
    return {
      inatención:                  parseFloat(formData.get('inatención') as string) || null,
      hiperactividad_impulsividad: parseFloat(formData.get('hiperactividad_impulsividad') as string) || null,
      problemas_aprendizaje:       parseFloat(formData.get('problemas_aprendizaje') as string) || null,
      funcionamiento_ejecutivo:    parseFloat(formData.get('funcionamiento_ejecutivo') as string) || null,
      agresión:                    parseFloat(formData.get('agresión') as string) || null,
      relaciones_pares:            parseFloat(formData.get('relaciones_pares') as string) || null,
      indice_tdah:                 parseFloat(formData.get('indice_tdah') as string) || null,
      dsm5_inatento:               parseFloat(formData.get('dsm5_inatento') as string) || null,
      dsm5_hiperactivo:            parseFloat(formData.get('dsm5_hiperactivo') as string) || null,
      indice_inconsistencia:       parseFloat(formData.get('indice_inconsistencia') as string) || null,
      indice_impresion_positiva:   parseFloat(formData.get('indice_impresion_positiva') as string) || null,
      indice_impresion_negativa:   parseFloat(formData.get('indice_impresion_negativa') as string) || null,
    }
  }
  if (codigo === 'BRIEF2') {
    return {
      inhibicion:               parseFloat(formData.get('inhibicion') as string) || null,
      supervision_conducta:     parseFloat(formData.get('supervision_conducta') as string) || null,
      flexibilidad:             parseFloat(formData.get('flexibilidad') as string) || null,
      control_emocional:        parseFloat(formData.get('control_emocional') as string) || null,
      cambio:                   parseFloat(formData.get('cambio') as string) || null,
      iniciativa:               parseFloat(formData.get('iniciativa') as string) || null,
      memoria_trabajo:          parseFloat(formData.get('memoria_trabajo') as string) || null,
      planificacion_organizacion: parseFloat(formData.get('planificacion_organizacion') as string) || null,
      organizacion_materiales:  parseFloat(formData.get('organizacion_materiales') as string) || null,
      monitoreo:                parseFloat(formData.get('monitoreo') as string) || null,
      BRI:                      parseFloat(formData.get('BRI') as string) || null,
      ERI:                      parseFloat(formData.get('ERI') as string) || null,
      CRI:                      parseFloat(formData.get('CRI') as string) || null,
      GEC:                      parseFloat(formData.get('GEC') as string) || null,
      inconsistencia:           parseFloat(formData.get('inconsistencia') as string) || null,
      negatividad:              parseFloat(formData.get('negatividad') as string) || null,
      magnitud:                 parseFloat(formData.get('magnitud') as string) || null,
    }
  }
  if (codigo === 'ADOS2') {
    const modulo = parseInt(formData.get('modulo') as string) as 1 | 2 | 3 | 4
    const total = parseFloat(formData.get('total_algoritmo') as string)
    const corte = ADOS2_PUNTOS_CORTE[modulo]
    const clasificacion =
      total <= corte.no_tea[1]   ? 'no_tea' :
      total <= corte.probable[1] ? 'tea_probable' : 'tea'
    return {
      modulo,
      social_affect_total: parseFloat(formData.get('social_affect_total') as string) || null,
      rrb_total:           modulo < 4 ? (parseFloat(formData.get('rrb_total') as string) || null) : null,
      total_algoritmo:     total,
      css_total:           parseFloat(formData.get('css_total') as string) || null,
      css_social_affect:   parseFloat(formData.get('css_social_affect') as string) || null,
      css_rrb:             modulo < 4 ? (parseFloat(formData.get('css_rrb') as string) || null) : null,
      clasificacion,
    }
  }
  if (codigo === 'WISCV') {
    return {
      semejanzas:               parseFloat(formData.get('semejanzas') as string) || null,
      vocabulario:              parseFloat(formData.get('vocabulario') as string) || null,
      diseno_cubos:             parseFloat(formData.get('diseno_cubos') as string) || null,
      matrices:                 parseFloat(formData.get('matrices') as string) || null,
      conceptos_figuras:        parseFloat(formData.get('conceptos_figuras') as string) || null,
      balanzas:                 parseFloat(formData.get('balanzas') as string) || null,
      retencion_digitos:        parseFloat(formData.get('retencion_digitos') as string) || null,
      secuencia_letras_numeros: parseFloat(formData.get('secuencia_letras_numeros') as string) || null,
      busqueda_simbolos:        parseFloat(formData.get('busqueda_simbolos') as string) || null,
      claves:                   parseFloat(formData.get('claves') as string) || null,
      VCI:                      parseFloat(formData.get('VCI') as string) || null,
      VSI:                      parseFloat(formData.get('VSI') as string) || null,
      FRI:                      parseFloat(formData.get('FRI') as string) || null,
      WMI:                      parseFloat(formData.get('WMI') as string) || null,
      PSI:                      parseFloat(formData.get('PSI') as string) || null,
      FSIQ:                     parseFloat(formData.get('FSIQ') as string) || null,
    }
  }
  // CAARS2, CPT3: leer campos genéricos
  const result: Record<string, unknown> = {}
  const reserved = new Set(['fecha_aplicacion', 'duracion_minutos', 'nombre_informante', 'observaciones_conductuales'])
  formData.forEach((value, key) => {
    if (!reserved.has(key)) {
      const num = parseFloat(value as string)
      result[key] = isNaN(num) ? null : num
    }
  })
  return result
}

export async function guardarPuntajes(
  detalleId: string,
  bateriaId: string,
  pacienteId: string,
  formData: FormData
): Promise<never> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const baseUrl = `/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}/instrumentos/${detalleId}`

  const { data: detalle } = await supabase
    .from('evaluacion_instrumento_detalle')
    .select('instrumento_id, informante, instrumentos_catalogo(codigo)')
    .eq('id', detalleId)
    .single()

  if (!detalle) {
    redirect(`${baseUrl}?error=${encodeURIComponent('Instrumento no encontrado')}`)
  }

  const instrumento = detalle.instrumentos_catalogo as { codigo: string } | null
  const codigo = instrumento?.codigo ?? ''

  // Validate nombre_informante when required
  const nombre_informante = (formData.get('nombre_informante') as string || '').trim() || null
  if (['padre', 'madre', 'maestro'].includes(detalle.informante) && !nombre_informante) {
    redirect(`${baseUrl}?error=${encodeURIComponent('El nombre del informante es obligatorio')}`)
  }

  // Validate T-scores range (20-100) for heteroinforme instruments
  if (['CONNERS3', 'BRIEF2', 'CAARS2'].includes(codigo)) {
    const tScores = buildPuntajesBrutos(codigo, formData)
    for (const [key, val] of Object.entries(tScores)) {
      if (val !== null && typeof val === 'number' && (val < 20 || val > 100)) {
        redirect(`${baseUrl}?error=${encodeURIComponent(`El puntaje T de "${key}" debe estar entre 20 y 100`)}`)
      }
    }
  }

  // Validate WISC-V scalar scores (1-19)
  if (codigo === 'WISCV') {
    const subpruebas = ['semejanzas', 'vocabulario', 'diseno_cubos', 'matrices', 'conceptos_figuras', 'balanzas', 'retencion_digitos', 'secuencia_letras_numeros', 'busqueda_simbolos', 'claves']
    for (const key of subpruebas) {
      const val = parseFloat(formData.get(key) as string)
      if (!isNaN(val) && (val < 1 || val > 19)) {
        redirect(`${baseUrl}?error=${encodeURIComponent(`El puntaje escalar de "${key}" debe estar entre 1 y 19`)}`)
      }
    }
  }

  // Validate ADOS-2 modulo and CSS
  if (codigo === 'ADOS2') {
    const modulo = parseInt(formData.get('modulo') as string)
    if (![1, 2, 3, 4].includes(modulo)) {
      redirect(`${baseUrl}?error=${encodeURIComponent('Seleccione un módulo ADOS-2 válido (1-4)')}`)
    }
    const cssFields = ['css_total', 'css_social_affect', 'css_rrb']
    for (const key of cssFields) {
      const val = parseFloat(formData.get(key) as string)
      if (!isNaN(val) && (val < 1 || val > 10)) {
        redirect(`${baseUrl}?error=${encodeURIComponent(`El CSS "${key}" debe estar entre 1 y 10`)}`)
      }
    }
  }

  const puntajes_brutos = buildPuntajesBrutos(codigo, formData)
  const fecha_aplicacion = (formData.get('fecha_aplicacion') as string || '').trim() || null
  const duracionRaw = formData.get('duracion_minutos') as string
  const duracion_minutos = duracionRaw && duracionRaw.trim() !== '' ? parseInt(duracionRaw) : null
  const observaciones_conductuales = (formData.get('observaciones_conductuales') as string || '').trim() || null

  const { error } = await supabase
    .from('evaluacion_instrumento_detalle')
    .update({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      puntajes_brutos: puntajes_brutos as any,
      fecha_aplicacion,
      duracion_minutos,
      nombre_informante,
      observaciones_conductuales,
      estado: 'puntuado',
    })
    .eq('id', detalleId)

  if (error) {
    redirect(`${baseUrl}?error=${encodeURIComponent('Error al guardar: ' + error.message)}`)
  }

  await insertAuditLog(supabase, {
    usuario_id:     userData.user.id,
    tabla_afectada: 'evaluacion_instrumento_detalle',
    registro_id:    detalleId,
    accion:         'UPDATE',
    datos_nuevos:   { estado: 'puntuado', bateria_id: bateriaId },
  })

  redirect(`/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}`)
}
