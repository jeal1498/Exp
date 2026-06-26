# expedientes-clinicos-neuro — Auditoría de proyecto

> Generado el 2026-06-26 · Sesión 21

---

## 1. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14.2 (App Router, SSR) |
| Lenguaje | TypeScript 5 (strict) |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) |
| PDF | `@react-pdf/renderer` v4 |
| Email | Resend v4 |
| Estilos | CSS Modules, diseño mobile-first |
| Auth | Supabase Auth + MFA TOTP (AAL2, desactivado temporalmente) |

**`package.json` — dependencias de producción**

```json
"@react-pdf/renderer": "^4.5.1"
"@supabase/ssr": "^0.10.3"
"@supabase/supabase-js": "^2.108.2"
"next": "14.2.15"
"react": "^18"
"react-dom": "^18"
"resend": "^4.8.0"
```

---

## 2. Estructura de archivos

```
src/
├── app/
│   ├── layout.tsx                          # Root layout
│   ├── page.tsx                            # Página de inicio
│   ├── globals.css
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   ├── enroll-mfa/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   └── verify-mfa/
│   │       ├── page.tsx
│   │       └── actions.ts
│   └── dashboard/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── loading.tsx
│       ├── NavLinks.tsx
│       ├── actions.ts
│       └── pacientes/
│           ├── page.tsx                    # Lista de pacientes
│           ├── loading.tsx
│           ├── nuevo/
│           │   ├── page.tsx
│           │   └── actions.ts
│           └── [pacienteId]/
│               ├── page.tsx               # Perfil del paciente
│               ├── evaluaciones/
│               │   ├── page.tsx
│               │   ├── nueva/
│               │   │   ├── page.tsx
│               │   │   └── actions.ts
│               │   └── [evaluacionId]/
│               │       ├── page.tsx
│               │       └── actions.ts
│               ├── notas/
│               │   ├── page.tsx
│               │   ├── nueva/
│               │   │   ├── page.tsx
│               │   │   └── actions.ts
│               │   └── [notaId]/
│               │       ├── page.tsx
│               │       └── actions.ts
│               ├── documentos/
│               │   ├── page.tsx
│               │   └── actions.ts
│               └── baterias/              # Módulo más reciente (Sesión 21)
│                   ├── page.tsx
│                   ├── nueva/
│                   │   ├── page.tsx
│                   │   └── actions.ts
│                   └── [bateriaId]/
│                       ├── page.tsx
│                       ├── informe/
│                       │   ├── page.tsx
│                       │   └── actions.ts
│                       └── instrumentos/
│                           └── [detalleId]/
│                               ├── page.tsx
│                               └── actions.ts
├── components/
│   ├── evaluaciones/
│   │   ├── FormAdos2.tsx
│   │   ├── FormBrief2.tsx
│   │   ├── FormCaars2.tsx
│   │   ├── FormConners3.tsx
│   │   ├── FormCpt3.tsx
│   │   └── FormWiscV.tsx
│   └── ui/
│       ├── ConfirmDeleteButton.tsx
│       └── SubmitButton.tsx
├── lib/
│   ├── curp.ts                            # Validación CURP (18 chars, regex)
│   ├── format.ts
│   ├── resend.ts
│   ├── storage.ts
│   ├── evaluaciones/
│   │   └── constants.ts                   # Instrumentos, baterías, dominios
│   ├── pdf/
│   │   └── InformeNeuropsicologico.tsx    # Generación PDF con @react-pdf
│   └── supabase/
│       ├── audit.ts
│       ├── auth.ts
│       ├── client.ts                      # Cliente browser
│       └── server.ts                      # Cliente SSR (cookies)
├── middleware.ts                           # Protege /dashboard/:path*
└── types/
    └── database.types.ts                  # Tipos generados desde schema Supabase
```

---

## 3. Rutas de la aplicación

| Ruta | Descripción |
|---|---|
| `/` | Landing / inicio |
| `/login` | Autenticación con Supabase |
| `/enroll-mfa` | Enrolamiento TOTP (QR) |
| `/verify-mfa` | Verificación del código TOTP |
| `/dashboard` | Panel principal |
| `/dashboard/pacientes` | Lista de pacientes |
| `/dashboard/pacientes/nuevo` | Crear nuevo paciente |
| `/dashboard/pacientes/[id]` | Perfil completo del paciente |
| `/dashboard/pacientes/[id]/evaluaciones` | Evaluaciones neuropsicológicas |
| `/dashboard/pacientes/[id]/evaluaciones/nueva` | Registrar evaluación |
| `/dashboard/pacientes/[id]/evaluaciones/[evId]` | Ver/editar evaluación |
| `/dashboard/pacientes/[id]/notas` | Notas de evolución SOAP |
| `/dashboard/pacientes/[id]/notas/nueva` | Crear nota SOAP |
| `/dashboard/pacientes/[id]/notas/[notaId]` | Ver/editar nota |
| `/dashboard/pacientes/[id]/documentos` | Documentos del paciente (Storage) |
| `/dashboard/pacientes/[id]/baterias` | Baterías de evaluación |
| `/dashboard/pacientes/[id]/baterias/nueva` | Crear batería |
| `/dashboard/pacientes/[id]/baterias/[batId]` | Ver batería y progreso |
| `/dashboard/pacientes/[id]/baterias/[batId]/instrumentos/[detId]` | Captura de instrumento |
| `/dashboard/pacientes/[id]/baterias/[batId]/informe` | Generar informe PDF |

**Middleware** (`src/middleware.ts`): protege todas las rutas bajo `/dashboard/*`. Redirige a `/login?redirect=<ruta>` si no hay sesión activa. MFA (AAL2) desactivado temporalmente en código.

---

## 4. Base de datos — Schema Supabase

### 4.1 Tablas

#### `pacientes`
Ficha clínica según NOM-004-SSA3-2012.

| Columna | Tipo | Restricciones |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `numero_expediente` | TEXT | UNIQUE NOT NULL |
| `nombre` | TEXT | NOT NULL |
| `apellido_paterno` | TEXT | NOT NULL |
| `apellido_materno` | TEXT | nullable |
| `fecha_nacimiento` | DATE | NOT NULL |
| `curp` | TEXT | UNIQUE, regex 18 chars |
| `sexo` | TEXT | CHECK IN ('M','F','Indeterminado') |
| `lateralidad` | TEXT | CHECK IN ('Diestro','Zurdo','Ambidiestro') |
| `escolaridad` | TEXT | nullable |
| `ocupacion` | TEXT | nullable |
| `domicilio` | TEXT | nullable |
| `telefono` | TEXT | nullable |
| `email` | TEXT | nullable |
| `medico_referente` | TEXT | nullable |
| `motivo_consulta` | TEXT | nullable |
| `diagnostico_previo` | TEXT | nullable |
| `consentimiento_informado` | BOOLEAN | DEFAULT false |
| `consentimiento_fecha` | TIMESTAMPTZ | nullable |
| `created_by` | UUID FK | `auth.users(id)` |
| `is_active` | BOOLEAN | DEFAULT true (eliminación lógica) |

No hay política DELETE — la eliminación es siempre lógica via `is_active = false`.

---

#### `anamnesis`
Historia clínica (NOM-004 art. 7.1).

| Columna | Tipo | Notas |
|---|---|---|
| `paciente_id` | UUID FK | ON DELETE RESTRICT |
| `antecedentes_heredofamiliares` | TEXT | |
| `antecedentes_personales_patologicos` | TEXT | |
| `antecedentes_perinatales` | TEXT | |
| `desarrollo_psicomotor` | TEXT | |
| `antecedentes_escolares` | TEXT | |
| `antecedentes_laborales` | TEXT | |
| `habitos` | JSONB | `{"tabaquismo": false, "alcoholismo": "ocasional"}` |
| `medicamentos_actuales` | JSONB | `[{"nombre": "Ritalin", "dosis": "10mg"}]` |
| `alergias` | TEXT | |

---

#### `evaluaciones_neuro`
Pruebas neuropsicológicas individuales.

| Columna | Tipo | Notas |
|---|---|---|
| `paciente_id` | UUID FK | ON DELETE RESTRICT |
| `fecha_evaluacion` | DATE | DEFAULT CURRENT_DATE |
| `nombre_prueba` | TEXT | NOT NULL |
| `dominio` | ENUM `dominio_cognitivo` | NOT NULL |
| `puntaje_bruto` | NUMERIC | |
| `percentil` | NUMERIC | CHECK 0–100 |
| `puntuacion_estandar` | NUMERIC | |
| `datos_adicionales` | JSONB | Datos extendidos por instrumento |
| `observaciones` | TEXT | |
| `is_locked` | BOOLEAN | DEFAULT false (NOM-004 art. 9) |
| `locked_at` | TIMESTAMPTZ | |
| `hash_integridad` | TEXT | SHA-256 al momento de bloqueo |

**Trigger:** `trg_prevent_evaluacion_update` bloquea UPDATE cuando `is_locked = true`.
**Trigger:** `trg_prevent_evaluacion_delete` bloquea DELETE siempre (inalterabilidad total).

---

#### `notas_evolucion`
Notas SOAP de evolución (NOM-004 art. 9).

| Columna | Tipo | Notas |
|---|---|---|
| `paciente_id` | UUID FK | ON DELETE RESTRICT |
| `fecha_nota` | TIMESTAMPTZ | |
| `subjetivo` | TEXT | |
| `objetivo` | TEXT | |
| `analisis` | TEXT | |
| `plan` | TEXT | |
| `codigo_cie11` | TEXT | Clasificación CIE-11 |
| `descripcion_cie11` | TEXT | |
| `is_locked` | BOOLEAN | DEFAULT false |
| `locked_at` | TIMESTAMPTZ | |
| `hash_integridad` | TEXT | SHA-256 (NOM-024) |

**Trigger:** `trg_notas_lock_guard` — lanza excepción si se intenta UPDATE sobre nota bloqueada.

---

#### `logs_auditoria`
Bitácora inmutable (NOM-024-SSA3-2012).

| Columna | Tipo |
|---|---|
| `usuario_id` | UUID FK → `auth.users` |
| `tabla_afectada` | TEXT |
| `registro_id` | UUID |
| `accion` | ENUM: INSERT, UPDATE, SELECT, DELETE |
| `datos_anteriores` | JSONB |
| `datos_nuevos` | JSONB |
| `ip_address` | INET |
| `user_agent` | TEXT |
| `sesion_id` | TEXT |

> Los eventos SELECT no pueden capturarse con triggers PostgreSQL. Se registran manualmente desde los Server Actions de Next.js.

---

### 4.2 Enum: `dominio_cognitivo`

```sql
'Memoria' | 'Atencion' | 'Funciones Ejecutivas' | 'Lenguaje'
| 'Visuoespacial' | 'Velocidad de Procesamiento'
| 'Habilidades Academicas' | 'Conducta y Emocion'
```

---

### 4.3 Triggers de sistema

| Trigger | Tabla | Evento | Función |
|---|---|---|---|
| `trg_pacientes_updated_at` | pacientes | BEFORE UPDATE | `set_updated_at()` |
| `trg_anamnesis_updated_at` | anamnesis | BEFORE UPDATE | `set_updated_at()` |
| `trg_notas_updated_at` | notas_evolucion | BEFORE UPDATE | `set_updated_at()` |
| `trg_notas_lock_guard` | notas_evolucion | BEFORE UPDATE | `prevent_locked_note_update()` |
| `trg_prevent_evaluacion_update` | evaluaciones_neuro | BEFORE UPDATE | `prevent_evaluacion_update()` |
| `trg_prevent_evaluacion_delete` | evaluaciones_neuro | BEFORE DELETE | `prevent_evaluacion_delete()` |
| `trg_pacientes_audit` | pacientes | AFTER INS/UPD/DEL | `audit_log()` |
| `trg_anamnesis_audit` | anamnesis | AFTER INS/UPD/DEL | `audit_log()` |
| `trg_evaluaciones_audit` | evaluaciones_neuro | AFTER INS/UPD/DEL | `audit_log()` |
| `trg_notas_audit` | notas_evolucion | AFTER INS/UPD/DEL | `audit_log()` |

---

### 4.4 Row Level Security (RLS)

Todas las tablas tienen RLS habilitado. Modelo: **profesional individual** — cada usuario accede solo a registros donde `created_by = auth.uid()`. Las tablas relacionadas (`anamnesis`, `evaluaciones_neuro`, `notas_evolucion`) usan `EXISTS (SELECT 1 FROM pacientes WHERE ...)` como defensa en profundidad.

**Estado actual:** AAL2 (MFA) removido de las políticas RLS en la migración `20260625000002`. La condición `(auth.jwt() -> 'aal')::text = '"aal2"'` fue eliminada. Para reactivar MFA, aplicar migración inversa.

---

### 4.5 Storage Buckets

| Bucket | Tamaño máx. | Tipos permitidos |
|---|---|---|
| `reportes-escaneados` | 20 MB | PDF, JPEG, PNG, WebP |
| `consentimientos-firmados` | 10 MB | PDF, JPEG, PNG |

Ambos buckets son **privados**. Estructura de rutas: `{userId}/{pacienteId}/{timestamp}-{filename}`.
RLS: SELECT, INSERT, DELETE propios (sin UPDATE — archivos inmutables; reemplazar = eliminar + subir).

---

### 4.6 Migraciones aplicadas

| Archivo | Descripción |
|---|---|
| `20260624000001_create_pacientes.sql` | Tabla pacientes, índices, trigger updated_at |
| `20260624000002_create_anamnesis.sql` | Tabla anamnesis |
| `20260624000003_create_evaluaciones_neuro.sql` | Tabla evaluaciones, enum dominio_cognitivo |
| `20260624000004_create_notas_evolucion.sql` | Tabla notas SOAP, trigger lock_guard |
| `20260624000005_create_logs_auditoria.sql` | Tabla auditoría, enum accion_auditoria |
| `20260624000006_rls_and_audit_triggers.sql` | RLS en todas las tablas + función audit_log() |
| `20260624000007_storage_buckets.sql` | Buckets Storage + políticas RLS |
| `20260625000001_clean_mfa_rpc.sql` | RPC `delete_unverified_mfa_factors()` SECURITY DEFINER |
| `20260625000002_remove_aal2_requirement.sql` | Elimina condición AAL2 de todas las políticas RLS |
| `20260625000003_evaluaciones_lock.sql` | Agrega `is_locked`, triggers de inalterabilidad a evaluaciones |

---

## 5. Instrumentos neuropsicológicos disponibles

Definidos en `src/lib/evaluaciones/constants.ts`:

| Código | Nombre | Tipo | Edad | Dominios | Informantes |
|---|---|---|---|---|---|
| CONNERS3 | Conners 3rd Edition | Heteroinforme | 6–18 | Conducta y Emoción | padre, madre, maestro, autoinforme |
| BRIEF-2 | Behavior Rating Inventory of Executive Function | Heteroinforme | 5–18 | Funciones Ejecutivas | padre, madre, maestro, autoinforme |
| ADOS-2 | Autism Diagnostic Observation Schedule | Observación directa | 1–99 | Conducta y Emoción | karen (evaluadora) |
| WISC-V | Wechsler Intelligence Scale for Children | Rendimiento | 6–16 | Funciones Ejecutivas | karen |
| CAARS-2 | Conners Adult ADHD Rating Scales | Heteroinforme | 18–99 | Atención | autoinforme, observador |
| CPT-3 | Conners Continuous Performance Test | Rendimiento | 8–99 | Atención | karen |

### Baterías predefinidas

| Batería | Instrumentos incluidos |
|---|---|
| `tdah_nino` | CONNERS3 (padre, maestro) + BRIEF-2 (padre, maestro) + CPT-3 |
| `tdah_adulto` | CAARS-2 (autoinforme, observador) + BRIEF-2 (autoinforme) + CPT-3 |
| `tea` | ADOS-2 + WISC-V + CONNERS3 (padre) + BRIEF-2 (padre) |
| `personalizada` | Selección manual de instrumentos |

### Estados de una batería

`en_curso` → `puntuacion_pendiente` → `borrador_informe` → `firmado` → `entregado`

### Puntos de corte ADOS-2

| Módulo | No TEA | Probable | TEA |
|---|---|---|---|
| 1 y 2 | 0–7 | 8–9 | ≥10 |
| 3 y 4 | 0–3 | 4–5 | ≥6 |

---

## 6. Seguridad y cumplimiento normativo

| Requisito | Implementación |
|---|---|
| NOM-004-SSA3-2012 — identificación | Tabla `pacientes` con CURP validado, número de expediente único |
| NOM-004 art. 5 — consentimiento | Campo `consentimiento_informado` + bucket `consentimientos-firmados` |
| NOM-004 art. 9 — inalterabilidad | Triggers `lock_guard` en notas y evaluaciones; `is_locked` + `hash_integridad` SHA-256 |
| NOM-004 — eliminación | Eliminación lógica únicamente (`is_active = false`), sin DELETE |
| NOM-024-SSA3-2012 — auditoría | Tabla `logs_auditoria` inmutable; triggers AFTER en todas las tablas de datos |
| NOM-024 — confidencialidad | RLS en todas las tablas; acceso solo a registros propios |
| MFA / AAL2 | Enrolamiento TOTP implementado (enroll-mfa / verify-mfa); condición AAL2 en RLS **desactivada temporalmente** en migración 002 |
| Storage | Buckets privados con RLS; archivos inmutables (sin UPDATE) |
| Auditoría SELECT | Manual en Server Actions (PostgreSQL triggers no capturan SELECT) |

---

## 7. Historial git reciente

```
464b3cc Fix CSS module path in informe/page.tsx (4 levels up, not 5)
6f25e42 Update memory.md: document Sesión 21 — módulo de baterías completo
2e6e2a8 Implement neuropsychological batteries evaluation module
4182c0a docs(memory): registrar sesión 20 — constantes, inalterabilidad evaluaciones, paginación
cf3aa10 feat: completar pendientes técnicos — constantes, inalterabilidad evaluaciones, paginación
87d8f80 docs(memory): registrar sesión 19 — auditoría técnica módulo evaluaciones
4a8871c Redesign UI as mobile-first: bottom nav, card lists, touch targets
147ee7a docs(memory): registrar sesión 18 — limpieza de ramas claude/*
5ece171 docs(memory): registrar sesión 17 — verificación end-to-end formulario pacientes
e9188ca fix(pacientes): corregir valores del select sexo para cumplir constraint BD
4da5be6 merge(impeccable-audit): integrar migración completa al sistema de diseño
6df8031 docs(memory): registrar sesión 16 — impeccable audit completo
7113b9d refactor(evaluaciones): migrate detail page to design system
67c0139 refactor(pacientes): migrate all pages to design system — impeccable audit fixes
4f4a576 docs(memory): registrar sesión 15 — dashboard con impeccable craft
```

---

## 8. Notas pendientes / deuda técnica

- **MFA desactivado**: la condición AAL2 fue removida de las políticas RLS y del middleware. Para reactivar, aplicar migración inversa que restaure `(auth.jwt() -> 'aal')::text = '"aal2"'` y descomentar la verificación en `middleware.ts`.
- **Auditoría SELECT**: debe implementarse manualmente en cada Server Action que lea datos sensibles (`audit.ts`).
- **Hash SHA-256**: el campo `hash_integridad` existe en `notas_evolucion` y `evaluaciones_neuro` pero la generación del hash al momento de bloqueo debe implementarse en la capa de aplicación (Server Action de bloqueo).
- **Pruebas (tests)**: no hay suite de tests configurada.
- **Tailwind / UI library**: el proyecto usa CSS Modules propio; no hay Tailwind, shadcn ni otra librería de componentes.
