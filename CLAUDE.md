# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Fuente de la verdad

Lee **`memory.md`** antes de iniciar cualquier sesión. Contiene el historial completo de implementación y el estado actual del proyecto.

## Comandos

```bash
npm run dev      # Servidor de desarrollo (http://localhost:3000)
npm run build    # Build de producción — verifica TypeScript y errores de ESLint
npm run lint     # ESLint
npm run start    # Ejecutar el build de producción
```

No hay suite de tests unitarios. La verificación se hace con `npm run build` (0 errores TS = build limpio) y revisión manual en el navegador.

## Stack

- **Next.js 14 App Router** + TypeScript
- **Supabase** — PostgreSQL, Auth (email/password), Storage (buckets privados)
- **Vercel** — hosting y despliegue
- **Resend** — notificaciones por email (login, bloqueo de notas)

## Arquitectura

### Rutas

```
src/app/
├── (auth)/          # Rutas públicas — login, páginas MFA (MFA actualmente deshabilitado)
└── dashboard/       # Rutas protegidas por src/middleware.ts
    └── pacientes/
        ├── page.tsx          # Lista de pacientes
        ├── nuevo/            # Formulario de alta
        └── [pacienteId]/
            ├── page.tsx      # Vista general del expediente
            ├── notas/        # Notas SOAP de evolución
            ├── evaluaciones/ # Puntuaciones de pruebas neuropsicológicas
            └── documentos/   # Gestión de archivos
```

Todas las mutaciones usan **Server Actions** — no hay API routes. Los formularios invocan actions directamente desde Server Components o Client Components mediante `action=`.

### Base de datos (Supabase)

Tablas principales:
- `pacientes` — registro maestro (CURP, nombre, fecha de nacimiento, sexo, lateralidad, escolaridad, consentimiento NOM-004)
- `anamnesis` — historia clínica con campos JSONB flexibles
- `evaluaciones_neuro` — puntuaciones de 13 pruebas estandarizadas (WAIS-IV, WISC-V, TMT, Stroop, etc.) en 8 dominios cognitivos
- `notas_evolucion` — notas en formato SOAP con códigos CIE-11; bloqueables con hash SHA-256 (inmutables tras el bloqueo)
- `logs_auditoria` — registro append-only; triggers PostgreSQL lo pueblan automáticamente en cada INSERT/UPDATE

**RLS** habilitado en todas las tablas — los usuarios solo acceden a sus propios registros (`created_by = auth.uid()`).

Los **triggers PostgreSQL** en `supabase/migrations/20260624000006_rls_and_audit_triggers.sql` escriben automáticamente a `logs_auditoria`. El propio log tiene triggers que impiden UPDATE y DELETE (NOM-024).

Buckets de Storage privados: `reportes-escaneados` (20 MB, PDF/JPEG/PNG/WebP) y `consentimientos-firmados` (10 MB, PDF/JPEG/PNG). Ruta de archivos: `{userId}/{pacienteId}/{timestamp}-{filename}`.

### Utilerías (`src/lib/`)

| Archivo | Propósito |
|---|---|
| `curp.ts` | Validación de CURP: formato + checksum RENAPO |
| `format.ts` | Formateo de fechas sin desfase UTC (`YYYY-MM-DD`) |
| `storage.ts` | URLs firmadas (1 h), listado y eliminación de archivos |
| `supabase/audit.ts` | Helper para inserción manual en `logs_auditoria` |
| `supabase/server.ts` | Cliente Supabase SSR (cookies HTTP-only) |
| `supabase/client.ts` | Cliente Supabase para el navegador |

### Sistema de diseño

- **Tokens** declarados como propiedades CSS personalizadas en `src/app/globals.css` (paleta oklch, escala tipográfica Inter, espaciado, radios)
- **CSS Modules** por página o sección (sin CSS-in-JS)
- Mobile-first: `≤480px` → `481–768px` → `≥769px`
- Skill `/impeccable` instalado en `.claude/skills/impeccable/` para trabajo de UI

### Compliance

- **NOM-004**: CURP obligatorio, fecha de consentimiento informado, notas bloqueadas con `is_locked` + hash SHA-256
- **NOM-024**: audit log inmutable vía triggers PostgreSQL

### MFA

El código de TOTP está implementado (`(auth)/enroll-mfa/`, `(auth)/verify-mfa/`) pero actualmente deshabilitado. Para reactivarlo: habilitar TOTP en el dashboard de Supabase, actualizar el middleware para exigir `aal2` y restaurar el redirect de login a `/enroll-mfa`.

## Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=
RESEND_API_KEY=        # Opcional — para notificaciones por email
RESEND_FROM_EMAIL=     # Opcional
```
