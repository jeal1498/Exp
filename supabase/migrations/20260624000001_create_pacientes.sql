-- Tabla principal de pacientes (NOM-004-SSA3-2012)
CREATE TABLE IF NOT EXISTS public.pacientes (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Identificación única del expediente
  numero_expediente        TEXT NOT NULL UNIQUE,

  -- Datos obligatorios NOM-004
  nombre                   TEXT NOT NULL,
  apellido_paterno         TEXT NOT NULL,
  apellido_materno         TEXT,
  fecha_nacimiento         DATE NOT NULL,
  curp                     TEXT NOT NULL UNIQUE,
  sexo                     TEXT NOT NULL CHECK (sexo IN ('M', 'F', 'Indeterminado')),

  -- Datos específicos de neuropsicología
  lateralidad              TEXT CHECK (lateralidad IN ('Diestro', 'Zurdo', 'Ambidiestro')),
  escolaridad              TEXT,

  -- Datos de contacto y referencia
  ocupacion                TEXT,
  domicilio                TEXT,
  telefono                 TEXT,
  email                    TEXT,
  medico_referente         TEXT,

  -- Motivo de consulta
  motivo_consulta          TEXT,
  diagnostico_previo       TEXT,

  -- Consentimiento informado (NOM-004 art. 5)
  consentimiento_informado BOOLEAN NOT NULL DEFAULT false,
  consentimiento_fecha     TIMESTAMPTZ,

  -- Trazabilidad
  created_by               UUID NOT NULL REFERENCES auth.users(id),
  is_active                BOOLEAN NOT NULL DEFAULT true,

  CONSTRAINT curp_format CHECK (curp ~ '^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9]{2}$')
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_pacientes_updated_at
  BEFORE UPDATE ON public.pacientes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_pacientes_curp ON public.pacientes(curp);
CREATE INDEX idx_pacientes_apellido ON public.pacientes(apellido_paterno, apellido_materno);
CREATE INDEX idx_pacientes_created_by ON public.pacientes(created_by);

COMMENT ON TABLE public.pacientes IS 'Catálogo de pacientes. Cumple NOM-004-SSA3-2012 art. 7 (datos de identificación).';
COMMENT ON COLUMN public.pacientes.curp IS 'Clave Única de Registro de Población — 18 caracteres, campo obligatorio NOM-004.';
COMMENT ON COLUMN public.pacientes.consentimiento_informado IS 'Consentimiento bajo información firmado, obligatorio NOM-004 art. 5.';
