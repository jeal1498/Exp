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
| 3 | Middleware de Protección y Ficha de Identificación (NOM-004) | 🔒 PENDIENTE |
| 4 | Módulo Clínico de Neuropsicología (Evaluaciones y Pruebas) | 🔒 PENDIENTE |
| 5 | Notas de Evolución e Inalterabilidad (Bloqueo Legal) | 🔒 PENDIENTE |
| 6 | Integraciones de Salida (Storage y Alertas por Correo) | 🔒 PENDIENTE |

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

**Sesión activa:** Sesión 3 — Etapa 2  
**Última actualización:** 2026-06-24  
**Próxima etapa a desbloquear:** Etapa 3 (requiere autorización del usuario)

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

---

## Reglas de Sesión (No Modificar)

1. Solo se ejecuta UNA etapa por sesión.
2. Al completar una etapa: actualizar este archivo, marcar como COMPLETADA, detenerse.
3. No enlazar etapas dentro de la misma sesión bajo ninguna circunstancia.
4. La siguiente etapa solo inicia con autorización explícita del usuario en una nueva sesión.
