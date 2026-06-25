-- RPC con SECURITY DEFINER para eliminar factores MFA no verificados del usuario actual.
-- Necesario porque listFactors() del SDK solo devuelve factores 'verified',
-- y los factores 'unverified' de intentos fallidos bloquean nuevas inscripciones.
CREATE OR REPLACE FUNCTION public.delete_unverified_mfa_factors()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth
AS $$
BEGIN
  DELETE FROM auth.mfa_factors
  WHERE user_id = auth.uid()
    AND status = 'unverified';
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_unverified_mfa_factors() TO authenticated;
