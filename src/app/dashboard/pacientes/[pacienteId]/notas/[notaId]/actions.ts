'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'

export async function bloquearNota(
  pacienteId: string,
  notaId: string,
  _formData: FormData
): Promise<never> {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const { data: nota, error: fetchError } = await supabase
    .from('notas_evolucion')
    .select('*')
    .eq('id', notaId)
    .eq('paciente_id', pacienteId)
    .single()

  if (fetchError || !nota) {
    redirect(
      `/dashboard/pacientes/${pacienteId}/notas/${notaId}?error=Nota+no+encontrada`
    )
  }

  if (nota.is_locked) {
    redirect(
      `/dashboard/pacientes/${pacienteId}/notas/${notaId}?error=La+nota+ya+está+bloqueada`
    )
  }

  // SHA-256 sobre campos de contenido inmutable (NOM-024 integridad)
  const content = JSON.stringify({
    paciente_id:      nota.paciente_id,
    fecha_nota:       nota.fecha_nota,
    subjetivo:        nota.subjetivo,
    objetivo:         nota.objetivo,
    analisis:         nota.analisis,
    plan:             nota.plan,
    codigo_cie11:     nota.codigo_cie11,
    descripcion_cie11: nota.descripcion_cie11,
    created_at:       nota.created_at,
  })
  const hash = createHash('sha256').update(content, 'utf8').digest('hex')

  const { error: updateError } = await supabase
    .from('notas_evolucion')
    .update({
      is_locked:       true,
      locked_at:       new Date().toISOString(),
      hash_integridad: hash,
    })
    .eq('id', notaId)
    .eq('is_locked', false)

  if (updateError) {
    redirect(
      `/dashboard/pacientes/${pacienteId}/notas/${notaId}?error=${encodeURIComponent('Error al bloquear: ' + updateError.message)}`
    )
  }

  redirect(`/dashboard/pacientes/${pacienteId}/notas/${notaId}`)
}
