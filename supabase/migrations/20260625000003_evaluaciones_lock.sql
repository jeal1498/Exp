-- Agregar inalterabilidad a evaluaciones_neuro (NOM-004 Art. 9 / NOM-024)
ALTER TABLE public.evaluaciones_neuro
  ADD COLUMN IF NOT EXISTS is_locked       boolean      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS locked_at       timestamptz  NULL,
  ADD COLUMN IF NOT EXISTS hash_integridad text         NULL;

-- Trigger: bloquear UPDATE cuando is_locked = true
CREATE OR REPLACE FUNCTION public.prevent_evaluacion_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.is_locked THEN
    RAISE EXCEPTION 'La evaluación está bloqueada y no puede modificarse (NOM-004 Art. 9)';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_evaluacion_update ON public.evaluaciones_neuro;
CREATE TRIGGER trg_prevent_evaluacion_update
  BEFORE UPDATE ON public.evaluaciones_neuro
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_evaluacion_update();

-- Trigger: bloquear DELETE siempre (inalterabilidad total)
CREATE OR REPLACE FUNCTION public.prevent_evaluacion_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE EXCEPTION 'Las evaluaciones no pueden eliminarse (NOM-004 Art. 9 — inalterabilidad)';
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_evaluacion_delete ON public.evaluaciones_neuro;
CREATE TRIGGER trg_prevent_evaluacion_delete
  BEFORE DELETE ON public.evaluaciones_neuro
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_evaluacion_delete();
