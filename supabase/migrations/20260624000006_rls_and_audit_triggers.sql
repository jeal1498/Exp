-- =============================================================================
-- Etapa 2 — Autenticación Médica y Políticas RLS
-- Cumple NOM-024-SSA3-2012: confidencialidad, trazabilidad, no repudio
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. Habilitar Row Level Security en todas las tablas
-- -----------------------------------------------------------------------------

ALTER TABLE public.pacientes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anamnesis          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluaciones_neuro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_evolucion    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_auditoria     ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- B. Políticas RLS — pacientes
--
-- Modelo: profesional individual (cada usuario accede solo a sus propios
-- pacientes via created_by). La condición AAL2 obliga a sesión con MFA
-- completado a nivel de base de datos, no solo a nivel de aplicación.
-- -----------------------------------------------------------------------------

CREATE POLICY "pacientes_select_own"
  ON public.pacientes FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    AND (auth.jwt() -> 'aal')::text = '"aal2"'
  );

CREATE POLICY "pacientes_insert_own"
  ON public.pacientes FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (auth.jwt() -> 'aal')::text = '"aal2"'
  );

CREATE POLICY "pacientes_update_own"
  ON public.pacientes FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    AND (auth.jwt() -> 'aal')::text = '"aal2"'
  )
  WITH CHECK (
    created_by = auth.uid()
    AND (auth.jwt() -> 'aal')::text = '"aal2"'
  );

-- Sin política DELETE: eliminación lógica únicamente via is_active = false (NOM-004).

-- -----------------------------------------------------------------------------
-- C. Políticas RLS — anamnesis
--
-- Acceso via EXISTS en pacientes para defensa en profundidad: incluso si
-- alguien insertara una fila con created_by incorrecto, la política padre
-- bloquea el acceso.
-- -----------------------------------------------------------------------------

CREATE POLICY "anamnesis_select_own"
  ON public.anamnesis FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'aal')::text = '"aal2"'
    AND EXISTS (
      SELECT 1 FROM public.pacientes
      WHERE pacientes.id = anamnesis.paciente_id
        AND pacientes.created_by = auth.uid()
    )
  );

CREATE POLICY "anamnesis_insert_own"
  ON public.anamnesis FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (auth.jwt() -> 'aal')::text = '"aal2"'
    AND EXISTS (
      SELECT 1 FROM public.pacientes
      WHERE pacientes.id = anamnesis.paciente_id
        AND pacientes.created_by = auth.uid()
    )
  );

CREATE POLICY "anamnesis_update_own"
  ON public.anamnesis FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'aal')::text = '"aal2"'
    AND EXISTS (
      SELECT 1 FROM public.pacientes
      WHERE pacientes.id = anamnesis.paciente_id
        AND pacientes.created_by = auth.uid()
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    AND (auth.jwt() -> 'aal')::text = '"aal2"'
    AND EXISTS (
      SELECT 1 FROM public.pacientes
      WHERE pacientes.id = anamnesis.paciente_id
        AND pacientes.created_by = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- D. Políticas RLS — evaluaciones_neuro
-- -----------------------------------------------------------------------------

CREATE POLICY "evaluaciones_select_own"
  ON public.evaluaciones_neuro FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'aal')::text = '"aal2"'
    AND EXISTS (
      SELECT 1 FROM public.pacientes
      WHERE pacientes.id = evaluaciones_neuro.paciente_id
        AND pacientes.created_by = auth.uid()
    )
  );

CREATE POLICY "evaluaciones_insert_own"
  ON public.evaluaciones_neuro FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (auth.jwt() -> 'aal')::text = '"aal2"'
    AND EXISTS (
      SELECT 1 FROM public.pacientes
      WHERE pacientes.id = evaluaciones_neuro.paciente_id
        AND pacientes.created_by = auth.uid()
    )
  );

CREATE POLICY "evaluaciones_update_own"
  ON public.evaluaciones_neuro FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'aal')::text = '"aal2"'
    AND EXISTS (
      SELECT 1 FROM public.pacientes
      WHERE pacientes.id = evaluaciones_neuro.paciente_id
        AND pacientes.created_by = auth.uid()
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    AND (auth.jwt() -> 'aal')::text = '"aal2"'
    AND EXISTS (
      SELECT 1 FROM public.pacientes
      WHERE pacientes.id = evaluaciones_neuro.paciente_id
        AND pacientes.created_by = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- E. Políticas RLS — notas_evolucion
--
-- El trigger trg_notas_lock_guard (Etapa 1) bloquea UPDATE en notas con
-- is_locked = true a nivel DB independientemente de RLS.
-- -----------------------------------------------------------------------------

CREATE POLICY "notas_select_own"
  ON public.notas_evolucion FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'aal')::text = '"aal2"'
    AND EXISTS (
      SELECT 1 FROM public.pacientes
      WHERE pacientes.id = notas_evolucion.paciente_id
        AND pacientes.created_by = auth.uid()
    )
  );

CREATE POLICY "notas_insert_own"
  ON public.notas_evolucion FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (auth.jwt() -> 'aal')::text = '"aal2"'
    AND EXISTS (
      SELECT 1 FROM public.pacientes
      WHERE pacientes.id = notas_evolucion.paciente_id
        AND pacientes.created_by = auth.uid()
    )
  );

CREATE POLICY "notas_update_own"
  ON public.notas_evolucion FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'aal')::text = '"aal2"'
    AND EXISTS (
      SELECT 1 FROM public.pacientes
      WHERE pacientes.id = notas_evolucion.paciente_id
        AND pacientes.created_by = auth.uid()
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    AND (auth.jwt() -> 'aal')::text = '"aal2"'
    AND EXISTS (
      SELECT 1 FROM public.pacientes
      WHERE pacientes.id = notas_evolucion.paciente_id
        AND pacientes.created_by = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- F. Políticas RLS — logs_auditoria
--
-- INSERT: necesario para que la aplicación registre eventos SELECT manualmente.
-- El trigger audit_log() usa SECURITY DEFINER y bypasa RLS directamente.
-- UPDATE/DELETE: bloqueados por triggers de inmutabilidad de Etapa 1.
-- -----------------------------------------------------------------------------

CREATE POLICY "auditoria_insert_authenticated"
  ON public.logs_auditoria FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "auditoria_select_own"
  ON public.logs_auditoria FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

-- -----------------------------------------------------------------------------
-- G. Función genérica de auditoría
--
-- SECURITY DEFINER: ejecuta con privilegios del propietario (postgres) para
-- insertar en logs_auditoria bypassando RLS. Esto es necesario porque los
-- triggers se ejecutan en el contexto de la operación original, no del usuario.
-- SET search_path = public: fija el search_path para prevenir ataques de
-- sustitución de esquema (search_path hijacking).
--
-- NOTA ARQUITECTÓNICA (NOM-024-SSA3-2012):
-- Los eventos SELECT no pueden auditarse mediante triggers de PostgreSQL ya que
-- los triggers solo responden a INSERT, UPDATE y DELETE. La auditoría de
-- consultas SELECT (lectura de expedientes) DEBE implementarse a nivel de
-- aplicación en los Server Actions de Next.js, insertando explícitamente en
-- logs_auditoria con accion = 'SELECT' después de cada consulta exitosa.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_accion    public.accion_auditoria;
  v_registro  UUID;
  v_anterior  JSONB;
  v_nuevo     JSONB;
  v_usuario   UUID;
  v_ip        INET;
  v_agent     TEXT;
  v_sesion    TEXT;
BEGIN
  IF    TG_OP = 'INSERT' THEN v_accion := 'INSERT';
  ELSIF TG_OP = 'UPDATE' THEN v_accion := 'UPDATE';
  ELSIF TG_OP = 'DELETE' THEN v_accion := 'DELETE';
  END IF;

  IF TG_OP = 'DELETE' THEN
    v_registro := OLD.id;
  ELSE
    v_registro := NEW.id;
  END IF;

  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    v_anterior := to_jsonb(OLD);
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    v_nuevo := to_jsonb(NEW);
  END IF;

  -- auth.uid() está disponible dentro de requests PostgREST via JWT context.
  -- En conexiones directas psql sin JWT retornará NULL (aceptable en producción).
  v_usuario := auth.uid();

  -- Metadatos de sesión inyectados por el middleware de la aplicación
  -- via SET LOCAL app.* al inicio de cada transacción PostgREST.
  BEGIN v_ip    := current_setting('app.ip_address', true)::INET; EXCEPTION WHEN OTHERS THEN v_ip    := NULL; END;
  BEGIN v_agent := current_setting('app.user_agent',  true);       EXCEPTION WHEN OTHERS THEN v_agent := NULL; END;
  BEGIN v_sesion := current_setting('app.session_id', true);       EXCEPTION WHEN OTHERS THEN v_sesion := NULL; END;

  INSERT INTO public.logs_auditoria (
    usuario_id, tabla_afectada, registro_id, accion,
    datos_anteriores, datos_nuevos, ip_address, user_agent, sesion_id
  ) VALUES (
    v_usuario, TG_TABLE_NAME, v_registro, v_accion,
    v_anterior, v_nuevo, v_ip, v_agent, v_sesion
  );

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

COMMENT ON FUNCTION public.audit_log() IS
  'Trigger genérico de auditoría automática. SECURITY DEFINER bypasa RLS para insertar en logs_auditoria. Cumple NOM-024-SSA3-2012 (trazabilidad, no repudio).';

-- -----------------------------------------------------------------------------
-- H. Conectar triggers de auditoría a las tablas de datos
--
-- AFTER (no BEFORE): el log se escribe solo si la operación original tuvo éxito,
-- garantizando coherencia entre lo registrado y lo realmente modificado.
-- logs_auditoria excluida intencionalmente: no se audita la bitácora de auditoría.
-- -----------------------------------------------------------------------------

CREATE TRIGGER trg_pacientes_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.pacientes
  FOR EACH ROW EXECUTE FUNCTION public.audit_log();

CREATE TRIGGER trg_anamnesis_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.anamnesis
  FOR EACH ROW EXECUTE FUNCTION public.audit_log();

CREATE TRIGGER trg_evaluaciones_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.evaluaciones_neuro
  FOR EACH ROW EXECUTE FUNCTION public.audit_log();

CREATE TRIGGER trg_notas_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.notas_evolucion
  FOR EACH ROW EXECUTE FUNCTION public.audit_log();
