-- Registro de auditoría inmutable (NOM-024-SSA3-2012)
CREATE TYPE public.accion_auditoria AS ENUM ('INSERT', 'UPDATE', 'SELECT', 'DELETE');

CREATE TABLE IF NOT EXISTS public.logs_auditoria (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  usuario_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tabla_afectada    TEXT NOT NULL,
  registro_id       UUID,
  accion            public.accion_auditoria NOT NULL,

  datos_anteriores  JSONB,
  datos_nuevos      JSONB,

  -- Contexto de red (NOM-024 trazabilidad)
  ip_address        INET,
  user_agent        TEXT,
  sesion_id         TEXT
);

-- Inmutabilidad total: sin UPDATE ni DELETE (NOM-024)
CREATE OR REPLACE FUNCTION public.prevent_audit_modification()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Los registros de auditoría son inmutables (NOM-024-SSA3-2012).';
END;
$$;

CREATE TRIGGER trg_audit_no_update
  BEFORE UPDATE ON public.logs_auditoria
  FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_modification();

CREATE TRIGGER trg_audit_no_delete
  BEFORE DELETE ON public.logs_auditoria
  FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_modification();

CREATE INDEX idx_audit_usuario ON public.logs_auditoria(usuario_id);
CREATE INDEX idx_audit_tabla ON public.logs_auditoria(tabla_afectada);
CREATE INDEX idx_audit_registro ON public.logs_auditoria(registro_id);
CREATE INDEX idx_audit_created_at ON public.logs_auditoria(created_at DESC);
CREATE INDEX idx_audit_accion ON public.logs_auditoria(accion);

COMMENT ON TABLE public.logs_auditoria IS 'Bitácora de auditoría inmutable. Cumple NOM-024-SSA3-2012 (trazabilidad, integridad, no repudio). UPDATE y DELETE bloqueados por triggers.';
COMMENT ON COLUMN public.logs_auditoria.ip_address IS 'Dirección IP del cliente al momento de la acción (NOM-024 trazabilidad de red).';
