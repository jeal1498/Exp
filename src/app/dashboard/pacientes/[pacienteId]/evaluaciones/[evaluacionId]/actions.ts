'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'

export async function bloquearEvaluacion(
  pacienteId: string,
  evaluacionId: string,
  _formData: FormData
): Promise<never> {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const { data: ev, error: fetchError } = await supabase
    .from('evaluaciones_neuro')
    .select('*')
    .eq('id', evaluacionId)
    .eq('paciente_id', pacienteId)
    .single()

  if (fetchError || !ev) {
    redirect(`/dashboard/pacientes/${pacienteId}/evaluaciones/${evaluacionId}?error=Evaluación+no+encontrada`)
  }

  if (ev.is_locked) {
    redirect(`/dashboard/pacientes/${pacienteId}/evaluaciones/${evaluacionId}?error=La+evaluación+ya+está+bloqueada`)
  }

  // SHA-256 sobre campos de contenido inmutable (NOM-024 integridad)
  const content = JSON.stringify({
    paciente_id:        ev.paciente_id,
    fecha_evaluacion:   ev.fecha_evaluacion,
    nombre_prueba:      ev.nombre_prueba,
    dominio:            ev.dominio,
    puntaje_bruto:      ev.puntaje_bruto,
    percentil:          ev.percentil,
    puntuacion_estandar: ev.puntuacion_estandar,
    observaciones:      ev.observaciones,
    datos_adicionales:  ev.datos_adicionales,
    created_at:         ev.created_at,
  })
  const hash = createHash('sha256').update(content, 'utf8').digest('hex')

  const { error: updateError } = await supabase
    .from('evaluaciones_neuro')
    .update({
      is_locked:       true,
      locked_at:       new Date().toISOString(),
      hash_integridad: hash,
    })
    .eq('id', evaluacionId)
    .eq('is_locked', false)

  if (updateError) {
    redirect(
      `/dashboard/pacientes/${pacienteId}/evaluaciones/${evaluacionId}?error=${encodeURIComponent('Error al bloquear: ' + updateError.message)}`
    )
  }

  redirect(`/dashboard/pacientes/${pacienteId}/evaluaciones/${evaluacionId}`)
}
