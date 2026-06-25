'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/supabase/audit'
import { TIPOS_BATERIA, BATERIAS_PREDEFINIDAS } from '@/lib/evaluaciones/constants'
import type { TipoBateria } from '@/lib/evaluaciones/constants'

export async function crearBateria(pacienteId: string, formData: FormData): Promise<never> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const tipo = (formData.get('tipo') as string || '').trim()
  if (!TIPOS_BATERIA.includes(tipo as TipoBateria)) {
    redirect(`/dashboard/pacientes/${pacienteId}/baterias/nueva?error=${encodeURIComponent('Tipo de batería inválido')}`)
  }

  const { data: bateria, error: bateriaError } = await supabase
    .from('baterias_evaluacion')
    .insert({
      paciente_id: pacienteId,
      tipo: tipo as TipoBateria,
      motivo_consulta: ((formData.get('motivo_consulta') as string) || '').trim() || null,
      created_by: userData.user.id,
    })
    .select('id')
    .single()

  if (bateriaError || !bateria) {
    redirect(`/dashboard/pacientes/${pacienteId}/baterias/nueva?error=${encodeURIComponent('Error al crear la batería')}`)
  }

  const { data: catalogo } = await supabase
    .from('instrumentos_catalogo')
    .select('id, codigo')

  const catalogoMap = Object.fromEntries((catalogo ?? []).map(i => [i.codigo, i.id]))

  if (tipo !== 'personalizada') {
    const preset = BATERIAS_PREDEFINIDAS[tipo as Exclude<TipoBateria, 'personalizada'>]
    const detalles = preset.flatMap(({ codigo, informantes }) =>
      informantes.map(informante => ({
        bateria_id: bateria.id,
        instrumento_id: catalogoMap[codigo],
        informante,
        created_by: userData.user.id,
      }))
    ).filter(d => d.instrumento_id)

    if (detalles.length > 0) {
      await supabase.from('evaluacion_instrumento_detalle').insert(detalles)
    }
  }

  await insertAuditLog(supabase, {
    usuario_id:     userData.user.id,
    tabla_afectada: 'baterias_evaluacion',
    registro_id:    bateria.id,
    accion:         'INSERT',
    datos_nuevos:   { paciente_id: pacienteId, tipo, created: true },
  })

  redirect(`/dashboard/pacientes/${pacienteId}/baterias/${bateria.id}`)
}
