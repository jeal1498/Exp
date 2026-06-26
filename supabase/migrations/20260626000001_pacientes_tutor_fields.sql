-- NOM-004 art. 5.1: datos del responsable legal para pacientes menores de 18 años
-- y campos de identificación adicionales (lugar de nacimiento, estado civil)
ALTER TABLE public.pacientes
  ADD COLUMN IF NOT EXISTS tutor_nombre TEXT,
  ADD COLUMN IF NOT EXISTS tutor_relacion TEXT
    CHECK (tutor_relacion IN (
      'Padre', 'Madre', 'Abuelo/a', 'Tutor legal', 'Otro'
    )),
  ADD COLUMN IF NOT EXISTS tutor_telefono TEXT,
  ADD COLUMN IF NOT EXISTS lugar_nacimiento TEXT,
  ADD COLUMN IF NOT EXISTS estado_civil TEXT
    CHECK (estado_civil IN (
      'Soltero/a', 'Casado/a', 'Divorciado/a',
      'Viudo/a', 'Unión libre', 'No aplica'
    ));
