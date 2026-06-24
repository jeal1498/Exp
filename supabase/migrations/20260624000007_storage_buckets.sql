-- =============================================================================
-- Etapa 6 — Supabase Storage Buckets (NOM-004 / NOM-024)
-- Buckets privados para documentos clínicos con RLS AAL2.
-- Sin política UPDATE: los archivos son inmutables (reemplazar = eliminar + subir).
-- Estructura de rutas: {userId}/{pacienteId}/{timestamp}-{filename}
-- =============================================================================

-- Bucket A: Reportes escaneados (20 MB, PDF/imágenes)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reportes-escaneados',
  'reportes-escaneados',
  false,
  20971520,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket B: Consentimientos firmados (10 MB, PDF/imágenes)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'consentimientos-firmados',
  'consentimientos-firmados',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------
-- RLS: reportes-escaneados
-- ---------------------------------------------------------------

CREATE POLICY "storage_reportes_select_own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'reportes-escaneados'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (auth.jwt() -> 'aal')::text = '"aal2"'
  );

CREATE POLICY "storage_reportes_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'reportes-escaneados'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (auth.jwt() -> 'aal')::text = '"aal2"'
  );

CREATE POLICY "storage_reportes_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'reportes-escaneados'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (auth.jwt() -> 'aal')::text = '"aal2"'
  );

-- ---------------------------------------------------------------
-- RLS: consentimientos-firmados
-- ---------------------------------------------------------------

CREATE POLICY "storage_consentimientos_select_own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'consentimientos-firmados'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (auth.jwt() -> 'aal')::text = '"aal2"'
  );

CREATE POLICY "storage_consentimientos_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'consentimientos-firmados'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (auth.jwt() -> 'aal')::text = '"aal2"'
  );

CREATE POLICY "storage_consentimientos_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'consentimientos-firmados'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (auth.jwt() -> 'aal')::text = '"aal2"'
  );
