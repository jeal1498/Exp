'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/supabase/audit'
import { BATERIAS_PREDEFINIDAS, TIPOS_BATERIA } from '@/lib/evaluaciones/constants'
import type { TipoBateria } from '@/lib/evaluaciones/constants'

export async function crearBateria(pacienteId: string, formData: FormData): Promise<never> {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const tipo = (formData.get('tipo') as string || '').trim() as TipoBateria
  if (!(TIPOS_BATERIA as readonly string[]).includes(tipo)) {
    redirect(
      `/dashboard/pacientes/${pacienteId}/baterias/nueva?error=${encodeURIComponent('Seleccione un tipo de batería válido')}`
    )
  }

  const motivo_consulta = (formData.get('motivo_consulta') as string || '').trim() || null

  const { data: bateria, error: bateriaError } = await supabase
    .from('baterias_evaluacion')
    .insert({
      paciente_id: pacienteId,
      tipo,
      motivo_consulta,
      estado: 'en_curso',
      created_by: userData.user.id,
    })
    .select('id')
    .single()

  if (bateriaError || !bateria) {
    redirect(
      `/dashboard/pacientes/${pacienteId}/baterias/nueva?error=${encodeURIComponent('Error al crear la batería: ' + (bateriaError?.message ?? 'sin datos'))}`
    )
  }

  // Insert instrument rows for preset batteries
  if (tipo !== 'personalizada') {
    const preset = BATERIAS_PREDEFINIDAS[tipo as Exclude<TipoBateria, 'personalizada'>]

    for (const { codigo, informantes } of preset) {
      const { data: instrumento } = await supabase
        .from('instrumentos_catalogo')
        .select('id')
        .eq('codigo', codigo)
        .single()

      if (!instrumento) continue

      for (const informante of informantes) {
        await supabase.from('evaluacion_instrumento_detalle').insert({
          bateria_id: bateria.id,
          instrumento_id: instrumento.id,
          informante,
          estado: 'pendiente',
          created_by: userData.user.id,
        })
      }
    }
  }

  await insertAuditLog(supabase, {
    usuario_id: userData.user.id,
    tabla_afectada: 'baterias_evaluacion',
    registro_id: bateria.id,
    accion: 'SELECT',
    datos_nuevos: { paciente_id: pacienteId, tipo },
  })

  redirect(`/dashboard/pacientes/${pacienteId}/baterias/${bateria.id}`)
}
