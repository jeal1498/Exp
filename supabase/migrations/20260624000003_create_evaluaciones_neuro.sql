-- Evaluaciones neuropsicológicas
CREATE TYPE public.dominio_cognitivo AS ENUM (
  'Memoria',
  'Atencion',
  'Funciones Ejecutivas',
  'Lenguaje',
  'Visuoespacial',
  'Velocidad de Procesamiento',
  'Habilidades Academicas',
  'Conducta y Emocion'
);

CREATE TABLE IF NOT EXISTS public.evaluaciones_neuro (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id          UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE RESTRICT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  fecha_evaluacion     DATE NOT NULL DEFAULT CURRENT_DATE,
  nombre_prueba        TEXT NOT NULL,
  dominio              public.dominio_cognitivo NOT NULL,

  puntaje_bruto        NUMERIC,
  percentil            NUMERIC CHECK (percentil BETWEEN 0 AND 100),
  puntuacion_estandar  NUMERIC,

  -- Datos extendidos por instrumento
  -- Ejemplo WAIS: {"indice_comprension_verbal": 105, "indice_razonamiento_perceptivo": 98}
  datos_adicionales    JSONB,

  observaciones        TEXT,
  created_by           UUID NOT NULL REFERENCES auth.users(id)
);

CREATE INDEX idx_evaluaciones_paciente ON public.evaluaciones_neuro(paciente_id);
CREATE INDEX idx_evaluaciones_dominio ON public.evaluaciones_neuro(dominio);
CREATE INDEX idx_evaluaciones_fecha ON public.evaluaciones_neuro(fecha_evaluacion);

COMMENT ON TABLE public.evaluaciones_neuro IS 'Registro de pruebas neuropsicológicas aplicadas. Esquema JSONB flexible para distintos instrumentos.';
COMMENT ON COLUMN public.evaluaciones_neuro.percentil IS 'Percentil de 0 a 100 respecto a la norma del instrumento.';
