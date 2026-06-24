-- Anamnesis / Historia clínica (NOM-004-SSA3-2012)
CREATE TABLE IF NOT EXISTS public.anamnesis (
  id                                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id                         UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE RESTRICT,
  created_at                          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                          TIMESTAMPTZ NOT NULL DEFAULT now(),

  antecedentes_heredofamiliares       TEXT,
  antecedentes_personales_patologicos TEXT,
  antecedentes_perinatales            TEXT,
  desarrollo_psicomotor               TEXT,
  antecedentes_escolares              TEXT,
  antecedentes_laborales              TEXT,

  -- Hábitos: {"tabaquismo": false, "alcoholismo": "ocasional", "drogas": false}
  habitos                             JSONB,

  -- Medicamentos: [{"nombre": "Ritalin", "dosis": "10mg", "frecuencia": "cada 8h"}]
  medicamentos_actuales               JSONB,

  alergias                            TEXT,

  created_by                          UUID NOT NULL REFERENCES auth.users(id)
);

CREATE TRIGGER trg_anamnesis_updated_at
  BEFORE UPDATE ON public.anamnesis
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_anamnesis_paciente ON public.anamnesis(paciente_id);

COMMENT ON TABLE public.anamnesis IS 'Historia clínica del paciente. Cumple NOM-004-SSA3-2012 art. 7.1 (historia clínica).';
