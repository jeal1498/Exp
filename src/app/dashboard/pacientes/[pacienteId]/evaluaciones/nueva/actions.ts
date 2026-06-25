'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DOMINIOS } from '@/lib/evaluaciones/constants'

const DOMINIOS_VALIDOS: readonly string[] = DOMINIOS

export async function crearEvaluacion(pacienteId: string, formData: FormData): Promise<never> {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const fecha_evaluacion = (formData.get('fecha_evaluacion') as string || '').trim()
  if (!fecha_evaluacion) {
    redirect(`/dashboard/pacientes/${pacienteId}/evaluaciones/nueva?error=${encodeURIComponent('La fecha de evaluación es obligatoria')}`)
  }

  const nombre_prueba = (formData.get('nombre_prueba') as string || '').trim()
  if (!nombre_prueba) {
    redirect(`/dashboard/pacientes/${pacienteId}/evaluaciones/nueva?error=${encodeURIComponent('El nombre de la prueba es obligatorio')}`)
  }

  const dominio = (formData.get('dominio') as string || '').trim()
  if (!DOMINIOS_VALIDOS.includes(dominio)) {
    redirect(`/dashboard/pacientes/${pacienteId}/evaluaciones/nueva?error=${encodeURIComponent('Seleccione un dominio cognitivo válido')}`)
  }

  const puntajeBrutoRaw = (formData.get('puntaje_bruto') as string || '').trim()
  const percentilRaw    = (formData.get('percentil')     as string || '').trim()
  const puntajeEstRaw   = (formData.get('puntuacion_estandar') as string || '').trim()

  const puntaje_bruto       = puntajeBrutoRaw !== '' ? Number(puntajeBrutoRaw) : null
  const percentil           = percentilRaw    !== '' ? Number(percentilRaw)    : null
  const puntuacion_estandar = puntajeEstRaw   !== '' ? Number(puntajeEstRaw)   : null

  if (percentil !== null && (percentil < 0 || percentil > 100)) {
    redirect(`/dashboard/pacientes/${pacienteId}/evaluaciones/nueva?error=${encodeURIComponent('El percentil debe estar entre 0 y 100')}`)
  }

  const observaciones = (formData.get('observaciones') as string || '').trim() || null

  const { error } = await supabase.from('evaluaciones_neuro').insert({
    paciente_id: pacienteId,
    fecha_evaluacion,
    nombre_prueba,
    dominio,
    puntaje_bruto,
    percentil,
    puntuacion_estandar,
    observaciones,
    created_by: userData.user.id,
  })

  if (error) {
    redirect(
      `/dashboard/pacientes/${pacienteId}/evaluaciones/nueva?error=${encodeURIComponent('Error al guardar evaluación: ' + error.message)}`
    )
  }

  redirect(`/dashboard/pacientes/${pacienteId}/evaluaciones`)
}
