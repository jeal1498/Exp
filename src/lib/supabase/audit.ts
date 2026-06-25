import type { Json } from '@/types/database.types'

type AuditAction = 'INSERT' | 'UPDATE' | 'SELECT' | 'DELETE'

interface AuditPayload {
  usuario_id: string | null
  tabla_afectada: string
  accion: AuditAction
  registro_id?: string | null
  datos_anteriores?: Json | null
  datos_nuevos?: Json | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function insertAuditLog(supabase: { from: (table: string) => any }, payload: AuditPayload) {
  await supabase.from('logs_auditoria').insert(payload)
}
