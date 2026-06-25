-- ============================================================
-- CATÁLOGO DE INSTRUMENTOS
-- ============================================================
CREATE TABLE public.instrumentos_catalogo (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo                TEXT NOT NULL UNIQUE,
  nombre_corto          TEXT NOT NULL,
  nombre_completo       TEXT NOT NULL,
  tipo                  TEXT NOT NULL CHECK (tipo IN (
                          'heteroinforme',
                          'observacion_directa',
                          'rendimiento'
                        )),
  rango_edad_min        SMALLINT NOT NULL DEFAULT 0,
  rango_edad_max        SMALLINT NOT NULL DEFAULT 99,
  informantes_posibles  TEXT[] NOT NULL DEFAULT '{}',
  dominio_principal     public.dominio_cognitivo NOT NULL,
  activo                BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.instrumentos_catalogo
  (codigo, nombre_corto, nombre_completo, tipo, rango_edad_min, rango_edad_max,
   informantes_posibles, dominio_principal)
VALUES
  ('CONNERS3','CONNERS-3','Conners 3rd Edition',
   'heteroinforme', 6, 18,
   ARRAY['padre','madre','maestro','autoinforme'], 'Conducta y Emocion'),

  ('BRIEF2','BRIEF-2','Behavior Rating Inventory of Executive Function 2nd Ed.',
   'heteroinforme', 5, 18,
   ARRAY['padre','madre','maestro','autoinforme'], 'Funciones Ejecutivas'),

  ('ADOS2','ADOS-2','Autism Diagnostic Observation Schedule 2nd Ed.',
   'observacion_directa', 1, 99,
   ARRAY['karen'], 'Conducta y Emocion'),

  ('WISCV','WISC-V','Wechsler Intelligence Scale for Children 5th Ed.',
   'rendimiento', 6, 16,
   ARRAY['karen'], 'Funciones Ejecutivas'),

  ('CAARS2','CAARS-2','Conners Adult ADHD Rating Scales 2nd Ed.',
   'heteroinforme', 18, 99,
   ARRAY['autoinforme','observador'], 'Atencion'),

  ('CPT3','CPT-3','Conners Continuous Performance Test 3rd Ed.',
   'rendimiento', 8, 99,
   ARRAY['karen'], 'Atencion');

-- ============================================================
-- TIPOS ENUM
-- ============================================================
CREATE TYPE public.tipo_bateria AS ENUM (
  'tdah_nino', 'tdah_adulto', 'tea', 'personalizada'
);

CREATE TYPE public.estado_bateria AS ENUM (
  'en_curso', 'puntuacion_pendiente', 'borrador_informe', 'firmado', 'entregado'
);

CREATE TYPE public.estado_instrumento AS ENUM (
  'pendiente', 'aplicado', 'puntuado', 'revisado'
);

-- ============================================================
-- BATERÍA DE EVALUACIÓN
-- ============================================================
CREATE TABLE public.baterias_evaluacion (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id               UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE RESTRICT,
  tipo                      public.tipo_bateria NOT NULL DEFAULT 'personalizada',
  estado                    public.estado_bateria NOT NULL DEFAULT 'en_curso',
  motivo_consulta           TEXT,
  observaciones_generales   TEXT,
  impresion_diagnostica     TEXT,
  recomendaciones           TEXT,

  -- Inmutabilidad NOM-004 (mismo patrón que notas_evolucion)
  is_locked                 BOOLEAN NOT NULL DEFAULT false,
  locked_at                 TIMESTAMPTZ,
  hash_integridad           TEXT,

  -- Informe clínico generado
  informe_storage_path      TEXT,
  informe_generado_at       TIMESTAMPTZ,

  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by                UUID NOT NULL REFERENCES auth.users(id),
  estado_updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_baterias_paciente ON public.baterias_evaluacion(paciente_id);
CREATE INDEX idx_baterias_estado   ON public.baterias_evaluacion(estado);

-- ============================================================
-- INSTRUMENTO DENTRO DE UNA BATERÍA
-- ============================================================
CREATE TABLE public.evaluacion_instrumento_detalle (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bateria_id                  UUID NOT NULL REFERENCES public.baterias_evaluacion(id) ON DELETE CASCADE,
  instrumento_id              UUID NOT NULL REFERENCES public.instrumentos_catalogo(id),
  informante                  TEXT NOT NULL CHECK (informante IN (
                                'karen','padre','madre','maestro','autoinforme','observador'
                              )),
  nombre_informante           TEXT,
  fecha_aplicacion            DATE,
  duracion_minutos            SMALLINT,
  estado                      public.estado_instrumento NOT NULL DEFAULT 'pendiente',
  puntajes_brutos             JSONB,
  puntajes_estandar           JSONB,
  observaciones_conductuales  TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by                  UUID NOT NULL REFERENCES auth.users(id),

  UNIQUE (bateria_id, instrumento_id, informante)
);

CREATE INDEX idx_eid_bateria     ON public.evaluacion_instrumento_detalle(bateria_id);
CREATE INDEX idx_eid_instrumento ON public.evaluacion_instrumento_detalle(instrumento_id);

-- ============================================================
-- TABLAS DE NORMAS
-- ============================================================
CREATE TABLE public.normas_conversion (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrumento_id    UUID NOT NULL REFERENCES public.instrumentos_catalogo(id),
  subescala         TEXT NOT NULL,
  informante        TEXT,
  edad_min_meses    SMALLINT NOT NULL,
  edad_max_meses    SMALLINT NOT NULL,
  genero            TEXT CHECK (genero IN ('M','F','mixto')) DEFAULT 'mixto',
  puntaje_bruto     NUMERIC NOT NULL,
  puntaje_escalar   SMALLINT,
  puntaje_t         SMALLINT,
  puntaje_indice    SMALLINT,
  percentil         SMALLINT,
  descripcion       TEXT
);

CREATE INDEX idx_normas_instrumento ON public.normas_conversion(instrumento_id, subescala, edad_min_meses);

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE TRIGGER set_baterias_updated_at
  BEFORE UPDATE ON public.baterias_evaluacion
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_eid_updated_at
  BEFORE UPDATE ON public.evaluacion_instrumento_detalle
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.prevent_locked_bateria_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.is_locked = true AND NEW.is_locked = true THEN
    RAISE EXCEPTION 'La batería está bloqueada y no puede modificarse (NOM-004 art. 9).';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_baterias_lock_guard
  BEFORE UPDATE ON public.baterias_evaluacion
  FOR EACH ROW EXECUTE FUNCTION public.prevent_locked_bateria_update();

CREATE TRIGGER trg_audit_baterias
  AFTER INSERT OR UPDATE OR DELETE ON public.baterias_evaluacion
  FOR EACH ROW EXECUTE FUNCTION public.audit_log();

CREATE TRIGGER trg_audit_eid
  AFTER INSERT OR UPDATE OR DELETE ON public.evaluacion_instrumento_detalle
  FOR EACH ROW EXECUTE FUNCTION public.audit_log();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.instrumentos_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baterias_evaluacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluacion_instrumento_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.normas_conversion ENABLE ROW LEVEL SECURITY;

CREATE POLICY catalogo_select ON public.instrumentos_catalogo
  FOR SELECT TO authenticated USING (activo = true);

CREATE POLICY normas_select ON public.normas_conversion
  FOR SELECT TO authenticated USING (true);

CREATE POLICY baterias_select ON public.baterias_evaluacion
  FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY baterias_insert ON public.baterias_evaluacion
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY baterias_update ON public.baterias_evaluacion
  FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY eid_select ON public.evaluacion_instrumento_detalle
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.baterias_evaluacion b
    WHERE b.id = bateria_id AND b.created_by = auth.uid()
  ));

CREATE POLICY eid_insert ON public.evaluacion_instrumento_detalle
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.baterias_evaluacion b
    WHERE b.id = bateria_id AND b.created_by = auth.uid()
  ));

CREATE POLICY eid_update ON public.evaluacion_instrumento_detalle
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.baterias_evaluacion b
    WHERE b.id = bateria_id AND b.created_by = auth.uid()
  ));
