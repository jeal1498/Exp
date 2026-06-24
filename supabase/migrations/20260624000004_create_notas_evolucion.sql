-- Notas de evolución (NOM-004-SSA3-2012 — inalterabilidad)
CREATE TABLE IF NOT EXISTS public.notas_evolucion (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id       UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE RESTRICT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  fecha_nota        TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Formato SOAP
  subjetivo         TEXT,
  objetivo          TEXT,
  analisis          TEXT,
  plan              TEXT,

  -- Clasificación CIE-11
  codigo_cie11      TEXT,
  descripcion_cie11 TEXT,

  -- Inalterabilidad NOM-004 art. 9
  is_locked         BOOLEAN NOT NULL DEFAULT false,
  locked_at         TIMESTAMPTZ,

  -- Integridad criptográfica NOM-024 (SHA-256 calculado al bloquear — Etapa 5)
  hash_integridad   TEXT,

  created_by        UUID NOT NULL REFERENCES auth.users(id)
);

-- Impide modificar notas bloqueadas
CREATE OR REPLACE FUNCTION public.prevent_locked_note_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.is_locked = true AND NEW.is_locked = true THEN
    RAISE EXCEPTION 'La nota de evolución está bloqueada y no puede modificarse (NOM-004 art. 9).';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notas_lock_guard
  BEFORE UPDATE ON public.notas_evolucion
  FOR EACH ROW EXECUTE FUNCTION public.prevent_locked_note_update();

CREATE TRIGGER trg_notas_updated_at
  BEFORE UPDATE ON public.notas_evolucion
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_notas_paciente ON public.notas_evolucion(paciente_id);
CREATE INDEX idx_notas_fecha ON public.notas_evolucion(fecha_nota DESC);
CREATE INDEX idx_notas_locked ON public.notas_evolucion(is_locked);

COMMENT ON TABLE public.notas_evolucion IS 'Notas SOAP de evolución. Bloqueadas tras tiempo reglamentario (NOM-004 art. 9). Hash SHA-256 de integridad (NOM-024).';
COMMENT ON COLUMN public.notas_evolucion.is_locked IS 'true = nota inalterabe. El trigger impide modificaciones.';
COMMENT ON COLUMN public.notas_evolucion.hash_integridad IS 'SHA-256 del contenido de la nota al momento de bloqueo (NOM-024 integridad).';
