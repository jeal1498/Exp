'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  tscore_descriptor_conners,
  tscore_descriptor_brief,
  ADOS2_PUNTOS_CORTE,
  wiscvIndexFromSum,
  wiscvFsiqFromSum,
  wiscvDescriptor,
  indexToPercentil,
} from '@/lib/evaluaciones/constants'
import type { Json } from '@/types/database.types'

function parseT(val: string | null): number | null {
  if (!val || val.trim() === '') return null
  const n = Number(val.trim())
  return isNaN(n) ? null : n
}

function parseN(val: string | null): number | null {
  if (!val || val.trim() === '') return null
  const n = Number(val.trim())
  return isNaN(n) ? null : n
}

function validateTScore(val: number | null, fieldName: string, errors: string[]) {
  if (val !== null && (val < 20 || val > 100)) {
    errors.push(`${fieldName}: el T-score debe estar entre 20 y 100`)
  }
}

function validateScalar(val: number | null, fieldName: string, errors: string[]) {
  if (val !== null && (val < 1 || val > 19)) {
    errors.push(`${fieldName}: el puntaje escalar debe estar entre 1 y 19`)
  }
}

export async function guardarPuntajes(
  pacienteId: string,
  bateriaId: string,
  detalleId: string,
  formData: FormData,
): Promise<never> {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const errorBase = `/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}/instrumentos/${detalleId}`

  const { data: detalle, error: detalleError } = await supabase
    .from('evaluacion_instrumento_detalle')
    .select('id, instrumento_id, informante, bateria_id')
    .eq('id', detalleId)
    .single()

  if (detalleError || !detalle) {
    redirect(`${errorBase}?error=${encodeURIComponent('Instrumento no encontrado')}`)
  }

  const { data: instrumento } = await supabase
    .from('instrumentos_catalogo')
    .select('codigo')
    .eq('id', detalle.instrumento_id)
    .single()

  if (!instrumento) {
    redirect(`${errorBase}?error=${encodeURIComponent('Catálogo de instrumento no encontrado')}`)
  }

  const codigo = instrumento.codigo
  const informante = detalle.informante
  const errors: string[] = []

  const nombre_informante = (formData.get('nombre_informante') as string || '').trim() || null
  const fecha_aplicacion = (formData.get('fecha_aplicacion') as string || '').trim() || null
  const duracion_minutos = parseN(formData.get('duracion_minutos') as string)
  const observaciones_conductuales = (formData.get('observaciones_conductuales') as string || '').trim() || null

  if (['padre', 'madre', 'maestro'].includes(informante) && !nombre_informante) {
    errors.push('El nombre del informante es obligatorio para padre, madre o maestro')
  }

  let puntajes_brutos: Json | null = null
  let puntajes_estandar: Json | null = null

  // ── CONNERS-3 ──────────────────────────────────────────────────────────────
  if (codigo === 'CONNERS3') {
    const fields = [
      'inatención',
      'hiperactividad_impulsividad',
      'funcionamiento_ejecutivo',
      'agresión',
      'relaciones_pares',
      'indice_tdah',
      'dsm5_inatento',
      'dsm5_hiperactivo',
      'problemas_aprendizaje',
      'indice_inconsistencia',
      'indice_impresion_positiva',
      'indice_impresion_negativa',
    ]
    const raw: Record<string, number | null> = {}
    for (const f of fields) {
      raw[f] = parseT(formData.get(f) as string)
    }

    const required = ['inatención', 'hiperactividad_impulsividad', 'funcionamiento_ejecutivo',
      'agresión', 'indice_tdah', 'dsm5_inatento', 'dsm5_hiperactivo']

    // relaciones_pares only required for padre/madre/autoinforme (not maestro per manual)
    if (informante !== 'maestro') required.push('relaciones_pares')
    // problemas_aprendizaje not in autoinforme
    if (informante !== 'autoinforme') required.push('problemas_aprendizaje')

    for (const f of required) {
      if (raw[f] === null) errors.push(`El campo "${f}" es obligatorio`)
      else validateTScore(raw[f], f, errors)
    }
    for (const f of fields) {
      if (raw[f] !== null && !required.includes(f)) validateTScore(raw[f], f, errors)
    }

    if (errors.length > 0) {
      redirect(`${errorBase}?error=${encodeURIComponent(errors.join(' · '))}`)
    }

    puntajes_brutos = raw
    puntajes_estandar = {
      ...raw,
      ...Object.fromEntries(
        required.filter(f => raw[f] !== null).map(f => [
          `${f}_categoria`,
          tscore_descriptor_conners(raw[f]!),
        ])
      ),
    }
  }

  // ── BRIEF-2 ────────────────────────────────────────────────────────────────
  else if (codigo === 'BRIEF2') {
    const scaleFields = [
      'inhibicion', 'supervision_conducta', 'flexibilidad', 'control_emocional',
      'cambio', 'iniciativa', 'memoria_trabajo', 'planificacion_organizacion',
      'organizacion_materiales', 'monitoreo',
    ]
    const indexFields = ['BRI', 'ERI', 'CRI', 'GEC']
    const validityFields = ['inconsistencia', 'negatividad', 'magnitud']

    const raw: Record<string, number | null> = {}
    for (const f of [...scaleFields, ...indexFields, ...validityFields]) {
      raw[f] = parseT(formData.get(f) as string)
    }

    for (const f of [...scaleFields, ...indexFields]) {
      if (raw[f] === null) errors.push(`El campo "${f}" es obligatorio`)
      else validateTScore(raw[f], f, errors)
    }
    for (const f of validityFields) {
      if (raw[f] !== null) validateTScore(raw[f], f, errors)
    }

    if (errors.length > 0) {
      redirect(`${errorBase}?error=${encodeURIComponent(errors.join(' · '))}`)
    }

    puntajes_brutos = raw
    puntajes_estandar = {
      ...raw,
      ...Object.fromEntries(
        [...scaleFields, ...indexFields].filter(f => raw[f] !== null).map(f => [
          `${f}_categoria`,
          tscore_descriptor_brief(raw[f]!),
        ])
      ),
    }
  }

  // ── ADOS-2 ─────────────────────────────────────────────────────────────────
  else if (codigo === 'ADOS2') {
    const modulo = parseN(formData.get('modulo') as string) as 1 | 2 | 3 | 4 | null
    if (!modulo || ![1, 2, 3, 4].includes(modulo)) {
      redirect(`${errorBase}?error=${encodeURIComponent('Seleccione un módulo válido (1-4)')}`)
    }

    const social_affect_total = parseN(formData.get('social_affect_total') as string)
    const rrb_total = modulo !== 4 ? parseN(formData.get('rrb_total') as string) : null
    const total_algoritmo = parseN(formData.get('total_algoritmo') as string)
    const css_total = parseN(formData.get('css_total') as string)
    const css_social_affect = parseN(formData.get('css_social_affect') as string)
    const css_rrb = modulo !== 4 ? parseN(formData.get('css_rrb') as string) : null
    const duracion_sesion = parseN(formData.get('duracion_sesion_minutos') as string)

    if (social_affect_total === null) errors.push('SA total es obligatorio')
    if (modulo !== 4 && rrb_total === null) errors.push('RRB total es obligatorio')
    if (total_algoritmo === null) errors.push('Total del algoritmo es obligatorio')
    if (css_total === null) errors.push('CSS total es obligatorio')
    else if (css_total < 1 || css_total > 10) errors.push('CSS total debe estar entre 1 y 10')
    if (css_social_affect === null) errors.push('CSS SA es obligatorio')
    else if (css_social_affect < 1 || css_social_affect > 10) errors.push('CSS SA debe estar entre 1 y 10')
    if (modulo !== 4 && css_rrb !== null && (css_rrb < 1 || css_rrb > 10)) errors.push('CSS RRB debe estar entre 1 y 10')

    if (errors.length > 0) {
      redirect(`${errorBase}?error=${encodeURIComponent(errors.join(' · '))}`)
    }

    const cortes = ADOS2_PUNTOS_CORTE[modulo as 1 | 2 | 3 | 4]
    const score = total_algoritmo!
    let clasificacion: 'no_tea' | 'tea_probable' | 'tea' = 'no_tea'
    if (score >= cortes.tea[0]) clasificacion = 'tea'
    else if (score >= cortes.probable[0]) clasificacion = 'tea_probable'

    puntajes_brutos = {
      modulo, social_affect_total, rrb_total, total_algoritmo,
      duracion_sesion_minutos: duracion_sesion,
    }
    puntajes_estandar = {
      modulo,
      social_affect_total,
      rrb_total,
      total_algoritmo,
      css_total,
      css_social_affect,
      css_rrb,
      clasificacion,
      duracion_sesion_minutos: duracion_sesion ?? null,
    }
  }

  // ── WISC-V ─────────────────────────────────────────────────────────────────
  else if (codigo === 'WISCV') {
    const subpruebas = [
      'semejanzas', 'vocabulario',
      'diseno_cubos', 'matrices',
      'conceptos_figuras', 'balanzas',
      'retencion_digitos', 'secuencia_letras_numeros',
      'busqueda_simbolos', 'claves',
    ]
    const raw: Record<string, number | null> = {}
    for (const s of subpruebas) raw[s] = parseN(formData.get(s) as string)

    for (const s of subpruebas) {
      if (raw[s] !== null) validateScalar(raw[s], s, errors)
    }

    if (errors.length > 0) {
      redirect(`${errorBase}?error=${encodeURIComponent(errors.join(' · '))}`)
    }

    // Index sums
    const vciSum = (raw.semejanzas ?? 0) + (raw.vocabulario ?? 0)
    const vsiSum = (raw.diseno_cubos ?? 0) + (raw.matrices ?? 0)
    const friSum = (raw.conceptos_figuras ?? 0) + (raw.balanzas ?? 0)
    const wmiSum = (raw.retencion_digitos ?? 0) + (raw.secuencia_letras_numeros ?? 0)
    const psiSum = (raw.busqueda_simbolos ?? 0) + (raw.claves ?? 0)
    const fsiqSum = vciSum + vsiSum + friSum + wmiSum + psiSum

    const VCI = wiscvIndexFromSum(vciSum)
    const VSI = wiscvIndexFromSum(vsiSum)
    const FRI = wiscvIndexFromSum(friSum)
    const WMI = wiscvIndexFromSum(wmiSum)
    const PSI = wiscvIndexFromSum(psiSum)
    const FSIQ = wiscvFsiqFromSum(fsiqSum)

    puntajes_brutos = raw
    puntajes_estandar = {
      VCI, VSI, FRI, WMI, PSI, FSIQ,
      VCI_percentil: indexToPercentil(VCI),
      VSI_percentil: indexToPercentil(VSI),
      FRI_percentil: indexToPercentil(FRI),
      WMI_percentil: indexToPercentil(WMI),
      PSI_percentil: indexToPercentil(PSI),
      FSIQ_percentil: indexToPercentil(FSIQ),
      FSIQ_descriptor: wiscvDescriptor(FSIQ),
    }
  }

  // ── CAARS-2 ────────────────────────────────────────────────────────────────
  else if (codigo === 'CAARS2') {
    const caarsFields = [
      'inatención', 'hiperactividad_impulsividad', 'problemas_autoconcepto',
      'dsm5_inatento', 'dsm5_hiperactivo', 'dsm5_total',
      'indice_inconsistencia', 'indice_impresion_positiva', 'indice_negativa_exagerada',
    ]
    const raw: Record<string, number | null> = {}
    for (const f of caarsFields) raw[f] = parseT(formData.get(f) as string)

    const required = ['inatención', 'hiperactividad_impulsividad', 'dsm5_inatento', 'dsm5_hiperactivo', 'dsm5_total']
    for (const f of required) {
      if (raw[f] === null) errors.push(`El campo "${f}" es obligatorio`)
      else validateTScore(raw[f], f, errors)
    }

    if (errors.length > 0) {
      redirect(`${errorBase}?error=${encodeURIComponent(errors.join(' · '))}`)
    }

    puntajes_brutos = raw
    puntajes_estandar = {
      ...raw,
      ...Object.fromEntries(
        required.filter(f => raw[f] !== null).map(f => [
          `${f}_categoria`,
          tscore_descriptor_conners(raw[f]!),
        ])
      ),
    }
  }

  // ── CPT-3 ──────────────────────────────────────────────────────────────────
  else if (codigo === 'CPT3') {
    const cptFields = [
      'omisiones', 'comisiones', 'perseveraciones',
      'TR', 'variabilidad_TR', 'detectabilidad',
      'respuesta_anticipada', 'variabilidad_entre_bloques',
      'indice_ADHD', 'confianza_inhibicion',
    ]
    const raw: Record<string, number | null> = {}
    for (const f of cptFields) raw[f] = parseT(formData.get(f) as string)

    for (const f of cptFields) {
      if (raw[f] !== null) validateTScore(raw[f], f, errors)
    }

    if (errors.length > 0) {
      redirect(`${errorBase}?error=${encodeURIComponent(errors.join(' · '))}`)
    }

    puntajes_brutos = raw
    puntajes_estandar = raw
  }

  else {
    redirect(`${errorBase}?error=${encodeURIComponent('Instrumento no soportado: ' + codigo)}`)
  }

  const { error: updateError } = await supabase
    .from('evaluacion_instrumento_detalle')
    .update({
      nombre_informante,
      fecha_aplicacion,
      duracion_minutos,
      observaciones_conductuales,
      puntajes_brutos,
      puntajes_estandar,
      estado: 'puntuado',
    })
    .eq('id', detalleId)

  if (updateError) {
    redirect(`${errorBase}?error=${encodeURIComponent('Error al guardar: ' + updateError.message)}`)
  }

  redirect(`/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}`)
}
