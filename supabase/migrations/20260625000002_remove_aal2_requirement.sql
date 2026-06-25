-- Eliminar requisito MFA (AAL2) de políticas RLS — MFA desactivado temporalmente.
-- Para reactivar MFA, aplicar la migración inversa que restaure la condición AAL2.

-- pacientes
DROP POLICY IF EXISTS "pacientes_select_own" ON public.pacientes;
DROP POLICY IF EXISTS "pacientes_insert_own" ON public.pacientes;
DROP POLICY IF EXISTS "pacientes_update_own" ON public.pacientes;

CREATE POLICY "pacientes_select_own" ON public.pacientes
  FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "pacientes_insert_own" ON public.pacientes
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "pacientes_update_own" ON public.pacientes
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- anamnesis
DROP POLICY IF EXISTS "anamnesis_select_own" ON public.anamnesis;
DROP POLICY IF EXISTS "anamnesis_insert_own" ON public.anamnesis;
DROP POLICY IF EXISTS "anamnesis_update_own" ON public.anamnesis;

CREATE POLICY "anamnesis_select_own" ON public.anamnesis
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.pacientes p
    WHERE p.id = anamnesis.paciente_id AND p.created_by = auth.uid()
  ));

CREATE POLICY "anamnesis_insert_own" ON public.anamnesis
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pacientes p
    WHERE p.id = anamnesis.paciente_id AND p.created_by = auth.uid()
  ));

CREATE POLICY "anamnesis_update_own" ON public.anamnesis
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.pacientes p
    WHERE p.id = anamnesis.paciente_id AND p.created_by = auth.uid()
  ));

-- evaluaciones_neuro
DROP POLICY IF EXISTS "evaluaciones_select_own" ON public.evaluaciones_neuro;
DROP POLICY IF EXISTS "evaluaciones_insert_own" ON public.evaluaciones_neuro;
DROP POLICY IF EXISTS "evaluaciones_update_own" ON public.evaluaciones_neuro;

CREATE POLICY "evaluaciones_select_own" ON public.evaluaciones_neuro
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.pacientes p
    WHERE p.id = evaluaciones_neuro.paciente_id AND p.created_by = auth.uid()
  ));

CREATE POLICY "evaluaciones_insert_own" ON public.evaluaciones_neuro
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pacientes p
    WHERE p.id = evaluaciones_neuro.paciente_id AND p.created_by = auth.uid()
  ));

CREATE POLICY "evaluaciones_update_own" ON public.evaluaciones_neuro
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.pacientes p
    WHERE p.id = evaluaciones_neuro.paciente_id AND p.created_by = auth.uid()
  ));

-- notas_evolucion
DROP POLICY IF EXISTS "notas_select_own" ON public.notas_evolucion;
DROP POLICY IF EXISTS "notas_insert_own" ON public.notas_evolucion;
DROP POLICY IF EXISTS "notas_update_own" ON public.notas_evolucion;

CREATE POLICY "notas_select_own" ON public.notas_evolucion
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.pacientes p
    WHERE p.id = notas_evolucion.paciente_id AND p.created_by = auth.uid()
  ));

CREATE POLICY "notas_insert_own" ON public.notas_evolucion
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pacientes p
    WHERE p.id = notas_evolucion.paciente_id AND p.created_by = auth.uid()
  ));

CREATE POLICY "notas_update_own" ON public.notas_evolucion
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.pacientes p
    WHERE p.id = notas_evolucion.paciente_id AND p.created_by = auth.uid()
  ));

-- logs_auditoria
DROP POLICY IF EXISTS "auditoria_select_own" ON public.logs_auditoria;
DROP POLICY IF EXISTS "auditoria_insert_own" ON public.logs_auditoria;

CREATE POLICY "auditoria_select_own" ON public.logs_auditoria
  FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "auditoria_insert_own" ON public.logs_auditoria
  FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());
