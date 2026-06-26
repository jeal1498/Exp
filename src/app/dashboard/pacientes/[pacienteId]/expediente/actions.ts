'use server'

import { createClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/supabase/audit'
import type { Database } from '@/types/database.types'

type Paciente = Database['public']['Tables']['pacientes']['Row']
type Anamnesis = Database['public']['Tables']['anamnesis']['Row']
type EvaluacionNeuro = Database['public']['Tables']['evaluaciones_neuro']['Row']
type NotaEvolucion = Database['public']['Tables']['notas_evolucion']['Row']
type Bateria = Database['public']['Tables']['baterias_evaluacion']['Row']

export interface ExpedienteData {
  paciente: Paciente | null
  anamnesis: Anamnesis | null
  evaluaciones: EvaluacionNeuro[]
  notas: NotaEvolucion[]
  baterias: Bateria[]
}

export async function getExpedienteData(pacienteId: string): Promise<ExpedienteData> {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return { paciente: null, anamnesis: null, evaluaciones: [], notas: [], baterias: [] }
  }

  const [pacienteRes, anamnesisRes, evaluacionesRes, notasRes, bateriasRes] = await Promise.all([
    supabase
      .from('pacientes')
      .select('*')
      .eq('id', pacienteId)
      .eq('is_active', true)
      .single(),
    supabase
      .from('anamnesis')
      .select('*')
      .eq('paciente_id', pacienteId)
      .maybeSingle(),
    supabase
      .from('evaluaciones_neuro')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('fecha_evaluacion'),
    supabase
      .from('notas_evolucion')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('fecha_nota', { ascending: false }),
    supabase
      .from('baterias_evaluacion')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('created_at'),
  ])

  // Registro de acceso en bitácora (SELECT manual requerido por NOM-024)
  await insertAuditLog(supabase, {
    usuario_id: userData.user.id,
    tabla_afectada: 'pacientes',
    accion: 'SELECT',
    registro_id: pacienteId,
    datos_nuevos: { contexto: 'expediente_completo' },
  })

  return {
    paciente: pacienteRes.data ?? null,
    anamnesis: anamnesisRes.data ?? null,
    evaluaciones: evaluacionesRes.data ?? [],
    notas: notasRes.data ?? [],
    baterias: bateriasRes.data ?? [],
  }
}
