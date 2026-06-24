'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function crearNota(pacienteId: string, formData: FormData): Promise<never> {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const fecha_nota = (formData.get('fecha_nota') as string || '').trim()
  if (!fecha_nota) {
    redirect(`/dashboard/pacientes/${pacienteId}/notas/nueva?error=La+fecha+de+la+nota+es+obligatoria`)
  }

  const subjetivo       = (formData.get('subjetivo')       as string || '').trim() || null
  const objetivo        = (formData.get('objetivo')        as string || '').trim() || null
  const analisis        = (formData.get('analisis')        as string || '').trim() || null
  const plan            = (formData.get('plan')            as string || '').trim() || null
  const codigo_cie11      = (formData.get('codigo_cie11')      as string || '').trim() || null
  const descripcion_cie11 = (formData.get('descripcion_cie11') as string || '').trim() || null

  if (!subjetivo && !objetivo && !analisis && !plan) {
    redirect(
      `/dashboard/pacientes/${pacienteId}/notas/nueva?error=${encodeURIComponent('Debe completar al menos un campo SOAP (S, O, A o P)')}`
    )
  }

  const { error } = await supabase.from('notas_evolucion').insert({
    paciente_id:     pacienteId,
    fecha_nota,
    subjetivo,
    objetivo,
    analisis,
    plan,
    codigo_cie11,
    descripcion_cie11,
    is_locked:  false,
    created_by: userData.user.id,
  })

  if (error) {
    redirect(
      `/dashboard/pacientes/${pacienteId}/notas/nueva?error=${encodeURIComponent('Error al guardar nota: ' + error.message)}`
    )
  }

  redirect(`/dashboard/pacientes/${pacienteId}/notas`)
}
