'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { uploadDocumento, deleteDocumento, type BucketId } from '@/lib/storage'

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
])

export async function subirDocumento(
  pacienteId: string,
  bucket: BucketId,
  formData: FormData,
): Promise<never> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    redirect(
      `/dashboard/pacientes/${pacienteId}/documentos?bucket=${bucket}&error=${encodeURIComponent('Seleccione un archivo.')}`,
    )
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    redirect(
      `/dashboard/pacientes/${pacienteId}/documentos?bucket=${bucket}&error=${encodeURIComponent('Tipo de archivo no permitido. Use PDF, JPEG o PNG.')}`,
    )
  }

  const { data, error } = await uploadDocumento(bucket, userData.user.id, pacienteId, file)

  if (error || !data) {
    redirect(
      `/dashboard/pacientes/${pacienteId}/documentos?bucket=${bucket}&error=${encodeURIComponent('Error al subir archivo: ' + (error?.message ?? 'desconocido'))}`,
    )
  }

  await supabase.from('logs_auditoria').insert({
    usuario_id: userData.user.id,
    accion: 'INSERT',
    tabla_afectada: 'storage',
    registro_id: null,
    datos_nuevos: { bucket, path: data.path, size: file.size, name: file.name },
  })

  redirect(`/dashboard/pacientes/${pacienteId}/documentos?bucket=${bucket}`)
}

export async function eliminarDocumento(
  pacienteId: string,
  bucket: BucketId,
  path: string,
  _formData: FormData,
): Promise<never> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  if (!path.startsWith(`${userData.user.id}/`)) {
    redirect(
      `/dashboard/pacientes/${pacienteId}/documentos?bucket=${bucket}&error=${encodeURIComponent('Acceso denegado.')}`,
    )
  }

  const { error } = await deleteDocumento(bucket, path)

  if (error) {
    redirect(
      `/dashboard/pacientes/${pacienteId}/documentos?bucket=${bucket}&error=${encodeURIComponent('Error al eliminar: ' + error.message)}`,
    )
  }

  await supabase.from('logs_auditoria').insert({
    usuario_id: userData.user.id,
    accion: 'DELETE',
    tabla_afectada: 'storage',
    registro_id: null,
    datos_anteriores: { bucket, path },
  })

  redirect(`/dashboard/pacientes/${pacienteId}/documentos?bucket=${bucket}`)
}
