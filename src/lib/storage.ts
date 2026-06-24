import { createClient } from '@/lib/supabase/server'

export type BucketId = 'reportes-escaneados' | 'consentimientos-firmados'

type StorageResult<T = void> =
  | { data: T; error: null }
  | { data: null; error: Error }

export type DocumentoFile = {
  name: string
  path: string
  size: number
  createdAt: string
  signedUrl: string
}

export async function uploadDocumento(
  bucket: BucketId,
  userId: string,
  pacienteId: string,
  file: File,
): Promise<StorageResult<{ path: string }>> {
  const supabase = await createClient()
  const path = `${userId}/${pacienteId}/${Date.now()}-${file.name}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })

  if (error) return { data: null, error: new Error(error.message) }
  return { data: { path }, error: null }
}

export async function listDocumentos(
  bucket: BucketId,
  userId: string,
  pacienteId: string,
): Promise<StorageResult<DocumentoFile[]>> {
  const supabase = await createClient()
  const folder = `${userId}/${pacienteId}`

  const { data: files, error } = await supabase.storage.from(bucket).list(folder, {
    sortBy: { column: 'created_at', order: 'desc' },
  })

  if (error) return { data: null, error: new Error(error.message) }

  const documentos: DocumentoFile[] = []
  for (const file of files ?? []) {
    const filePath = `${folder}/${file.name}`
    const { data: signedData } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600)

    documentos.push({
      name: file.name,
      path: filePath,
      size: file.metadata?.size ?? 0,
      createdAt: file.created_at ?? '',
      signedUrl: signedData?.signedUrl ?? '',
    })
  }

  return { data: documentos, error: null }
}

export async function deleteDocumento(
  bucket: BucketId,
  path: string,
): Promise<StorageResult> {
  const supabase = await createClient()
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) return { data: null, error: new Error(error.message) }
  return { data: undefined, error: null }
}
