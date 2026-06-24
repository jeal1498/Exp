# MEMORY.MD — Fuente de la Verdad del Proyecto

> Archivo de memoria persistente. Actualizar al inicio y al final de cada sesión.

---

## Objetivo General

Construir un **Sistema de Gestión de Expedientes Clínicos** para una neuropsicóloga que cumpla íntegramente con:
- **NOM-004-SSA3-2012**: Del Expediente Clínico (campos obligatorios, inalterabilidad, consentimiento informado).
- **NOM-024-SSA3-2012**: Sistemas de información de registro electrónico para la salud (logs de auditoría, integridad de datos, confidencialidad).
- Organismo regulador: **COFEPRIS** (México).

**Stack tecnológico:**
- Frontend/Backend: Next.js 14+ con App Router
- Base de datos / Auth / Storage: Supabase (PostgreSQL + RLS)
- Despliegue: Vercel
- Correo transaccional: Resend

---

## Plan de Etapas de Implementación

| # | Etapa | Estado |
|---|-------|--------|
| 0 | Inicialización de Memoria y Archivos Base | ✅ COMPLETADA |
| 1 | Infraestructura Base y Seguridad (Supabase & Configs) | ✅ COMPLETADA |
| 2 | Autenticación Médica y Políticas RLS (Seguridad NOM-024) | ✅ COMPLETADA |
| 3 | Middleware de Protección y Ficha de Identificación (NOM-004) | ✅ COMPLETADA |
| 4 | Módulo Clínico de Neuropsicología (Evaluaciones y Pruebas) | ✅ COMPLETADA |
| 5 | Notas de Evolución e Inalterabilidad (Bloqueo Legal) | ✅ COMPLETADA |
| 6 | Integraciones de Salida (Storage y Alertas por Correo) | ✅ COMPLETADA |

---

## Detalle de Etapas

### Etapa 1 — Infraestructura Base y Seguridad
**Objetivo:** Configurar el núcleo seguro de la base de datos.
**Entregables:**
- Estructura de carpetas estándar del repositorio
- Scripts SQL de migración en `supabase/migrations/` para las tablas:
  - `pacientes`
  - `anamnesis`
  - `evaluaciones_neuro`
  - `notas_evolucion`
  - `logs_auditoria`
- Archivo `.env.example` con variables de entorno requeridas

### Etapa 2 — Autenticación Médica y Políticas RLS
**Objetivo:** Garantizar que ningún dato de salud sea accesible sin permiso explícito.
**Entregables:**
- Políticas de Row Level Security (RLS) para todas las tablas en Supabase
- Triggers PostgreSQL automáticos e inmutables para registrar en `logs_auditoria` cada lectura/modificación
- Estructura de Next.js para Supabase Auth con MFA (Autenticación Multifactor)

### Etapa 3 — Middleware de Protección y Ficha de Identificación
**Objetivo:** Controlar rutas del frontend y capturar información mandatoria del paciente.
**Entregables:**
- `middleware.ts` para proteger rutas bajo `/dashboard`
- Módulo de visualización y alta de pacientes con campos legales obligatorios:
  - CURP válida (regex + dígito verificador)
  - Lateralidad
  - Escolaridad

### Etapa 4 — Módulo Clínico de Neuropsicología
**Objetivo:** Digitalizar las herramientas diagnósticas de la especialista.
**Entregables:**
- Interfaz y lógica para capturar puntajes brutos y percentiles de pruebas neuropsicológicas (esquema JSONB flexible)
- Componentes visuales con gráficos de rendimiento cognitivo por dominios:
  - Memoria
  - Atención
  - Funciones Ejecutivas

### Etapa 5 — Notas de Evolución e Inalterabilidad
**Objetivo:** Garantizar que los registros médicos no puedan ser alterados retroactivamente.
**Entregables:**
- Módulo para redactar Notas de Evolución enlazadas al catálogo CIE-11
- Lógica de bloqueo (`is_locked` tras tiempo reglamentario)
- Generación de hash criptográfico (SHA-256) de integridad por nota

### Etapa 6 — Integraciones de Salida
**Objetivo:** Manejo de archivos adjuntos y comunicación con el paciente/especialista.
**Entregables:**
- Conexión con Supabase Storage para reportes escaneados y consentimientos firmados
- Cliente Resend en `src/lib/resend.ts` para notificaciones automáticas de seguridad al especialista

---

## Estado Actual del Proyecto

**Sesión activa:** Sesión 7 — Etapa 6  
**Última actualización:** 2026-06-24  
**Próxima etapa a desbloquear:** Ninguna (proyecto completo)

---

## Registro de Sesiones

### Sesión 1 — 2026-06-24
**Objetivo:** Inicializar archivos de memoria del proyecto (Paso 0).  
**Logrado:**
- Creado `/claude.md` con introducción al proyecto y referencia a este archivo.
- Creado `/memory.md` (este archivo) con objetivos, etapas y estado.
- Commit inicial en rama `claude/neuropsych-clinical-records-j80gwi`.

**Estado al cerrar sesión:** Paso 0 COMPLETADO. Esperando autorización del usuario para iniciar Etapa 1 en nueva sesión.

### Sesión 2 — 2026-06-24
**Objetivo:** Etapa 1 — Infraestructura Base y Seguridad.
**Logrado:**
- Creada rama `claude/stage-1-memory-xbz3ay` desde `claude/neuropsych-clinical-records-j80gwi`.
- Boilerplate Next.js 14 + Supabase: `package.json`, `next.config.ts`, `tsconfig.json`.
- App Router mínimo: `src/app/layout.tsx`, `src/app/page.tsx`.
- Clientes Supabase tipados: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`.
- Tipos TypeScript del esquema: `src/types/database.types.ts`.
- Config Supabase CLI: `supabase/config.toml`.
- Variables de entorno: `.env.example`.
- 5 migraciones SQL con cumplimiento normativo:
  - `20260624000001_create_pacientes.sql` — CURP único, consentimiento informado, validación regex NOM-004.
  - `20260624000002_create_anamnesis.sql` — Historia clínica con JSONB flexible.
  - `20260624000003_create_evaluaciones_neuro.sql` — ENUM de dominios cognitivos, percentil validado.
  - `20260624000004_create_notas_evolucion.sql` — SOAP + CIE-11 + trigger de inalterabilidad NOM-004.
  - `20260624000005_create_logs_auditoria.sql` — Inmutabilidad total, triggers anti-UPDATE/DELETE, NOM-024.

**Estado al cerrar sesión:** Etapa 1 COMPLETADA. Esperando autorización del usuario para iniciar Etapa 2.

### Sesión 3 — 2026-06-24
**Objetivo:** Etapa 2 — Autenticación Médica y Políticas RLS.  
**Logrado:**
- Migración SQL `20260624000006_rls_and_audit_triggers.sql`:
  - RLS habilitado en las 5 tablas con condición AAL2 (MFA obligatoria a nivel DB).
  - Políticas SELECT/INSERT/UPDATE para `pacientes` (ownership via `created_by`).
  - Políticas SELECT/INSERT/UPDATE para `anamnesis`, `evaluaciones_neuro`, `notas_evolucion` (ownership via EXISTS en `pacientes`).
  - Políticas SELECT/INSERT para `logs_auditoria` (inmutabilidad garantizada por triggers de Etapa 1).
  - Función `public.audit_log()` con SECURITY DEFINER para registrar INSERT/UPDATE/DELETE automáticamente.
  - Triggers AFTER en las 4 tablas de datos clínicos.
- `src/lib/supabase/auth.ts` — helpers server-side: signIn, signOut, getUser, getSession, enrollMFA, verifyMFAEnrollment, challengeMFA, verifyMFA.
- `src/app/(auth)/layout.tsx` — layout del grupo de rutas de autenticación.
- `src/app/(auth)/login/page.tsx` + `actions.ts` — página de inicio de sesión con Server Action de dos pasos.
- `src/app/(auth)/verify-mfa/page.tsx` + `actions.ts` — verificación TOTP con elevación a AAL2.

**Estado al cerrar sesión:** Etapa 2 COMPLETADA. Esperando autorización del usuario para iniciar Etapa 3.

### Sesión 4 — 2026-06-24
**Objetivo:** Etapa 3 — Middleware de Protección y Ficha de Identificación.  
**Logrado:**
- `src/middleware.ts` — Middleware de protección de rutas `/dashboard`:
  - Sin sesión → redirige a `/login?redirect=...`.
  - AAL1 (MFA no verificado) + factor TOTP inscrito → redirige a `/verify-mfa?factorId=...`.
  - AAL1 sin MFA inscrito → redirige a `/enroll-mfa`.
  - AAL2 → deja pasar (refresca cookies de sesión).
- `src/lib/curp.ts` — Validación de CURP con regex NOM-004 + dígito verificador (algoritmo RENAPO):
  - Mapa de valores de caracteres (0-9 → 0-36, A-Z con Ñ).
  - Pesos posicionales (18 a 1 para las primeras 17 posiciones).
  - Verificación: `(10 - suma % 10) % 10 === dígito[17]`.
- `src/app/(auth)/enroll-mfa/page.tsx` + `actions.ts` — Inscripción MFA con QR TOTP y verificación.
- `src/app/dashboard/layout.tsx` — Layout del dashboard con nav, correo del usuario y botón de cierre de sesión.
- `src/app/dashboard/page.tsx` — Panel principal con conteo de pacientes activos y accesos rápidos.
- `src/app/dashboard/pacientes/page.tsx` — Lista de pacientes activos con número de expediente, nombre, CURP y fecha.
- `src/app/dashboard/pacientes/nuevo/page.tsx` — Formulario de alta con todos los campos NOM-004:
  - Nombre completo, fecha de nacimiento, sexo.
  - CURP (con validación cliente-side de 18 chars + server-side con dígito verificador).
  - Lateralidad (Diestro / Zurdo / Ambidiestro) — obligatorio para neuropsicología.
  - Escolaridad (12 niveles) — obligatorio para neuropsicología.
  - Campos opcionales: ocupación, domicilio, teléfono, email, motivo de consulta.
  - Checkbox de consentimiento informado (Art. 7 NOM-004) — bloquea el submit si no está marcado.
- `src/app/dashboard/pacientes/nuevo/actions.ts` — Server Action `crearPaciente`:
  - Valida CURP con `validarCURP()` antes de insertar.
  - Genera `numero_expediente` como `EXP-{año}-{timestamp[-7]}`.
  - Maneja error 23505 (CURP duplicada) con mensaje legible.
  - Registra `consentimiento_fecha` con la fecha del día.
- `src/app/page.tsx` — Redirige automáticamente a `/dashboard`.
- `src/app/dashboard/actions.ts` — Server Action `signOutAction` para el botón de cierre de sesión.

**Estado al cerrar sesión:** Etapa 3 COMPLETADA. Esperando autorización del usuario para iniciar Etapa 4.

### Sesión 5 — 2026-06-24
**Objetivo:** Etapa 5 — Notas de Evolución e Inalterabilidad.  
**Logrado:**
- `src/app/dashboard/pacientes/page.tsx` — filas de pacientes con enlace clickeable a su expediente.
- `src/app/dashboard/pacientes/[pacienteId]/page.tsx` — hub del expediente con datos del paciente y acceso a módulos.
- `src/app/dashboard/pacientes/[pacienteId]/notas/page.tsx` — lista de notas SOAP con indicador de estado (Borrador / Bloqueada) y auditoría SELECT (NOM-024).
- `src/app/dashboard/pacientes/[pacienteId]/notas/nueva/actions.ts` — Server Action `crearNota` con validación de al menos un campo SOAP.
- `src/app/dashboard/pacientes/[pacienteId]/notas/nueva/page.tsx` — formulario SOAP con selector CIE-11 via `<datalist>` (15 códigos de neuropsicología).
- `src/app/dashboard/pacientes/[pacienteId]/notas/[notaId]/actions.ts` — Server Action `bloquearNota`: SHA-256 del contenido de la nota, bloqueo atómico con guard `.eq('is_locked', false)`, NOM-024.
- `src/app/dashboard/pacientes/[pacienteId]/notas/[notaId]/page.tsx` — detalle de nota con botón de bloqueo irreversible y visualización de hash SHA-256 y `locked_at` para notas bloqueadas.

**Estado al cerrar sesión:** Etapa 5 COMPLETADA. Esperando autorización del usuario para iniciar Etapa 6.

### Sesión 6 — 2026-06-24
**Objetivo:** Etapa 4 — Módulo Clínico de Neuropsicología.  
**Logrado:**
- `src/app/dashboard/pacientes/[pacienteId]/evaluaciones/page.tsx` — Lista de evaluaciones con tabla y gráfico SVG de barras de percentiles por dominio cognitivo (8 dominios, coloreado por rango: rojo/naranja/verde).
- `src/app/dashboard/pacientes/[pacienteId]/evaluaciones/nueva/actions.ts` — Server Action `crearEvaluacion`: validación de campos obligatorios (fecha, prueba, dominio), validación de rango percentil 0–100, inserción en `evaluaciones_neuro` con `created_by`.
- `src/app/dashboard/pacientes/[pacienteId]/evaluaciones/nueva/page.tsx` — Formulario con datalist de 13 pruebas comunes (WAIS-IV, WISC-V, TMT-A/B, Stroop, FAS, BNT, RAVLT, RBMT, SDMT, Figura de Rey, MMSE, MoCA), selector de 8 dominios cognitivos, campos numéricos para puntaje bruto, percentil y puntuación estándar.
- `src/app/dashboard/pacientes/[pacienteId]/evaluaciones/[evaluacionId]/page.tsx` — Vista de detalle con indicador gráfico SVG de percentil (barra horizontal coloreada con marcadores de referencia en 25 y 75), visualización de datos adicionales JSONB si existen, auditoría NOM-024.
- `src/app/dashboard/pacientes/[pacienteId]/page.tsx` — Enlace a "Evaluaciones Neuropsicológicas" agregado en los módulos del expediente.

**Estado al cerrar sesión:** Etapa 4 COMPLETADA. Esperando autorización del usuario para iniciar Etapa 6.

---

### Sesión 7 — 2026-06-24
**Objetivo:** Etapa 6 — Integraciones de Salida (Storage y Alertas por Correo).  
**Logrado:**
- `supabase/migrations/20260624000007_storage_buckets.sql` — Dos buckets privados con RLS AAL2:
  - `reportes-escaneados` (20 MB, PDF/JPEG/PNG/WEBP) con políticas SELECT/INSERT/DELETE.
  - `consentimientos-firmados` (10 MB, PDF/JPEG/PNG) con políticas SELECT/INSERT/DELETE.
  - Sin política UPDATE: inalterabilidad de archivos conforme a NOM-004.
  - Estructura de rutas: `{userId}/{pacienteId}/{timestamp}-{filename}`.
- `src/lib/resend.ts` — Cliente Resend con dos funciones de notificación:
  - `sendLoginAlertEmail()` — alerta de seguridad tras inicio de sesión exitoso.
  - `sendNotaLockedEmail()` — notificación al especialista al bloquear nota (incluye hash SHA-256).
  - Manejo de errores fire-and-forget: falla de correo no interrumpe flujo principal.
- `src/lib/storage.ts` — Helpers de Supabase Storage:
  - `uploadDocumento()` — sube archivo a bucket con path único (timestamp).
  - `listDocumentos()` — lista archivos con URLs firmadas de 1 hora.
  - `deleteDocumento()` — elimina archivo por path.
- `src/app/dashboard/pacientes/[pacienteId]/documentos/actions.ts` — Server Actions:
  - `subirDocumento()` — valida tipo MIME, sube a Storage, registra en `logs_auditoria`.
  - `eliminarDocumento()` — valida ownership de path, elimina de Storage, audita.
- `src/app/dashboard/pacientes/[pacienteId]/documentos/page.tsx` — UI de documentos:
  - Tabs para alternar entre buckets vía `?bucket=` searchParam.
  - Formulario de carga con `encType="multipart/form-data"`.
  - Tabla de archivos con nombre, tamaño, fecha, enlace de descarga (URL firmada) y botón de eliminación.
- `next.config.ts` — Agrega `serverActions.bodySizeLimit: '21mb'` para soportar PDFs de hasta 20 MB.
- `package.json` — Agrega dependencia `resend@^4.8.0`.
- `.env.example` — Agrega `RESEND_FROM_EMAIL`.
- `src/app/(auth)/login/actions.ts` — Dispara `sendLoginAlertEmail()` tras autenticación exitosa.
- `src/app/dashboard/pacientes/[pacienteId]/notas/[notaId]/actions.ts` — Dispara `sendNotaLockedEmail()` tras bloqueo de nota con hash SHA-256.
- `src/app/dashboard/pacientes/[pacienteId]/page.tsx` — Enlace al módulo "Documentos Adjuntos".

**Estado al cerrar sesión:** Etapa 6 COMPLETADA. Proyecto finalizado en su totalidad.

---

## Reglas de Sesión (No Modificar)

1. Solo se ejecuta UNA etapa por sesión.
2. Al completar una etapa: actualizar este archivo, marcar como COMPLETADA, detenerse.
3. No enlazar etapas dentro de la misma sesión bajo ninguna circunstancia.
4. La siguiente etapa solo inicia con autorización explícita del usuario en una nueva sesión.
5. Al finalizar cada etapa: hacer merge directo de la rama de trabajo a `main` y push a origin. No crear Pull Requests.
