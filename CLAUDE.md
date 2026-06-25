# PsychoCore — Expedientes Clínicos Neuropsicológicos
## Psicóloga: Karen Trujillo · TDAH y TEA · Cancún

---

## Stack técnico

- **Next.js 14.2.15** App Router · TypeScript 5 · Node ≥20
- **Supabase JS client** directo (sin ORM) · PostgreSQL 17 · región `us-west-2`
- **CSS Modules** (`pacientes.module.css`) — sin Tailwind, sin shadcn
- **Sin**: Zod, react-hook-form, Prisma, Drizzle
- **Con**: `@react-pdf/renderer` (instalado), `resend` (email)
- Vercel deployment

---

## Patrones de código — respetar siempre

- **Server Components** para SELECT · **Server Actions** para INSERT/UPDATE
- Formularios: `<form action={serverAction}>` + `SubmitButton` con `useFormStatus`
- Errores: `redirect('...?error=' + encodeURIComponent(msg))`
- `insertAuditLog()` manual en Server Components que hagan SELECT
- Triggers automáticos para INSERT/UPDATE/DELETE (función `audit_log()`)
- Migraciones: `mcp__Supabase__apply_migration` (no CLI)
- Navegación: `<a href>` nativo (no `<Link>` de Next.js)
- Gráficas: SVG inline en Server Components (sin librería)
- CSS clases disponibles en `pacientes.module.css`: `.tableWrapper`, `.table`, `.tr`, `.td`, `.tdNumeric`, `.th`, `.thNumeric`, `.actionsCell`, `.tableLink`, `.btnPrimary`, `.btnGhost`, `.form`, `.fieldset`, `.fieldGroup`, `.labelFor`, `.labelHint`, `.required`, `.input`, `.select`, `.textarea`, `.formActions`, `.sectionHeading`, `.chartWrapper`, `.chartLegend`, `.chartLegendItem`, `.alert`, `.metaList`, `.metaLabel`, `.metaValue`, `.metaValueMono`, `.pageHeader`, `.pageTitle`, `.pageAction`, `.breadcrumb`, `.breadcrumbList`, `.breadcrumbItem`, `.breadcrumbSep`, `.backLink`, `.empty`, `.divider`, `.moduleList`, `.moduleItem`, `.moduleLink`, `.percentilLow`, `.percentilMid`, `.percentilHigh`, `.hashBlock`, `.soapContent`

---

## Archivos clave de infraestructura

| Archivo | Función |
|---------|---------|
| `src/lib/supabase/server.ts` | `createClient()` para Server Components/Actions |
| `src/lib/supabase/audit.ts` | `insertAuditLog(supabase, payload)` |
| `src/lib/supabase/client.ts` | `createClient()` para Client Components |
| `src/lib/storage.ts` | `uploadDocumento(bucket, userId, pacienteId, file: File)` · `listDocumentos()` · `deleteDocumento()` |
| `src/lib/format.ts` | `formatFecha(date)` · `formatFechaHora(date)` — locale es-MX |
| `src/lib/resend.ts` | `sendNotaLockedEmail()` |
| `src/lib/evaluaciones/constants.ts` | **Fuente única** de todas las constantes del módulo de evaluaciones |
| `src/lib/pdf/InformeNeuropsicologico.tsx` | Template PDF con `@react-pdf/renderer` |
| `src/types/database.types.ts` | Tipos TypeScript de todas las tablas Supabase |
| `src/components/ui/SubmitButton.tsx` | Botón con `useFormStatus` (pending state) |

---

## Base de datos — tablas existentes

### Tablas originales
- `pacientes` — expediente clínico principal
- `anamnesis` — historia clínica por paciente
- `evaluaciones_neuro` — instrumento suelto (legacy, no eliminar)
- `notas_evolucion` — notas SOAP con bloqueo NOM-004 (`is_locked`, `locked_at`, `hash_integridad`)
- `logs_auditoria` — inmutable, con triggers para INSERT/UPDATE/DELETE

### Tablas nuevas (migración 20260625000003)
- `instrumentos_catalogo` — catálogo de 6 instrumentos de Karen (CONNERS3, BRIEF2, ADOS2, WISCV, CAARS2, CPT3)
- `baterias_evaluacion` — unidad de trabajo clínico; tiene `is_locked` / `hash_integridad` igual que `notas_evolucion`
- `evaluacion_instrumento_detalle` — una fila por instrumento × informante dentro de una batería; campos `puntajes_brutos JSONB` y `puntajes_estandar JSONB`
- `normas_conversion` — tabla de normas para conversión bruto → estandarizado (vacía por ahora)

### ENUMs en DB
- `dominio_cognitivo` (existía) — 8 valores
- `accion_auditoria` (existía) — INSERT/UPDATE/SELECT/DELETE
- `tipo_bateria` (nueva) — tdah_nino / tdah_adulto / tea / personalizada
- `estado_bateria` (nueva) — en_curso / puntuacion_pendiente / borrador_informe / firmado / entregado
- `estado_instrumento` (nueva) — pendiente / aplicado / puntuado / revisado

### Funciones de trigger existentes (no recrear)
- `set_updated_at()` — actualiza `updated_at`
- `audit_log()` — registra INSERT/UPDATE/DELETE en `logs_auditoria`
- `prevent_locked_note_update()` — bloquea edición de notas firmadas
- `prevent_locked_bateria_update()` — bloquea edición de baterías firmadas (nueva)

---

## Módulo de baterías — implementado ✅

### Fuente única de constantes: `src/lib/evaluaciones/constants.ts`
Exporta: `DOMINIOS_COGNITIVOS`, `DOMINIOS_LABEL`, `PRUEBAS_COMUNES`, `TIPOS_BATERIA`, `TIPO_BATERIA_LABEL`, `ESTADOS_BATERIA`, `ESTADO_BATERIA_LABEL`, `INFORMANTES`, `INFORMANTE_LABEL`, `INSTRUMENTOS_KAREN`, `BATERIAS_PREDEFINIDAS`, `ADOS2_PUNTOS_CORTE`, `WISCV_INDICE_CONVERSION`, `WISCV_FSIQ_CONVERSION`, `wiscvIndexFromSum()`, `wiscvFsiqFromSum()`, `wiscvDescriptor()`, `indexToPercentil()`, `tscore_descriptor_conners()`, `tscore_descriptor_brief()`

### Rutas implementadas
```
/dashboard/pacientes/[pacienteId]/baterias/
├── page.tsx                    ← lista de baterías + tabla X/Y puntuados
├── nueva/
│   ├── page.tsx                ← radio por tipo + preview instrumentos del preset
│   └── actions.ts              ← crearBateria(): inserta batería + detalles del preset
└── [bateriaId]/
    ├── page.tsx                ← resumen, badge estado, barra SVG progreso,
    │                              tabla agrupada por instrumento, perfil SVG multi-informante
    ├── instrumentos/
    │   └── [detalleId]/
    │       ├── page.tsx        ← formulario condicional por instrumento.codigo
    │       └── actions.ts      ← guardarPuntajes(): valida, calcula categorías, UPDATE JSONB
    └── informe/
        ├── page.tsx            ← editar impresión + recomendaciones, descargar PDF, firmar
        └── actions.ts          ← generarInforme(), firmarBateria() con SHA-256
```

### Formularios de captura implementados
| Instrumento | Lógica especial |
|-------------|----------------|
| CONNERS3 | Campos por informante: maestro sin `relaciones_pares`, autoinforme sin `problemas_aprendizaje` |
| BRIEF2 | 10 escalas + 4 índices compuestos + 3 validez; umbral clínico T≥65 |
| ADOS2 | Select de módulo (1-4), totales SA/RRB/algoritmo, CSS; clasificación automática |
| WISCV | 10 puntajes escalares; índices calculados (VCI/VSI/FRI/WMI/PSI/FSIQ) con conversión aproximada |
| CAARS2 | T-scores, DSM-5, índices de validez |
| CPT3 | T-scores importados del reporte, sin cálculo propio |

### PDF e informe
- `@react-pdf/renderer` instalado y configurado
- Template: 9 secciones (encabezado, paciente, motivo, instrumentos aplicados, resultados por instrumento, impresión diagnóstica, recomendaciones, firma)
- Marca de agua "FIRMADO" en baterías bloqueadas
- Sube a bucket `reportes-escaneados`
- Locking: SHA-256 sobre JSON de todos los `puntajes_estandar` + metadatos de batería

### Navegación
- `[pacienteId]/page.tsx`: "Baterías de Evaluación" es el primer módulo del expediente
- Muestra resumen de últimas 3 baterías con tabla
- Las evaluaciones sueltas legacy siguen disponibles como "Evaluaciones Sueltas (legado)"

---

## Módulo de evaluaciones sueltas (legacy) — no tocar

```
/dashboard/pacientes/[pacienteId]/evaluaciones/
├── page.tsx          (SVG bar chart por dominio)
├── nueva/page.tsx    (formulario)
└── [evaluacionId]/page.tsx
```
Refactorizados para importar de `constants.ts` pero sin cambios de lógica.

---

## Storage buckets
- `reportes-escaneados` — PDFs de informes e informes escaneados
- `consentimientos-firmados` — consentimientos firmados

`uploadDocumento(bucket, userId, pacienteId, file: File)` usa `File`, no `Buffer`.
Para subir PDFs generados: usar `supabase.storage.from('reportes-escaneados').upload(path, buffer, { contentType: 'application/pdf', upsert: true })` directamente.

---

## Pendientes / trabajo futuro

### Alta prioridad (funcionalidad incompleta)
1. **Tablas de normas WISC-V reales** — la conversión escalar→índice actual es una aproximación lineal simplificada. Para producción se necesitan las tablas exactas del manual (cargadas en `normas_conversion`). La estructura de la tabla ya existe.
2. **Email de confirmación al firmar batería** — `firmarBateria()` NO envía email todavía (a diferencia de `bloquearNota()` que sí lo hace via Resend). Agregar llamada a `sendNotaLockedEmail()` o crear `sendBateriaFirmadaEmail()`.
3. **Instrumento `personalizada`** — la UI de nueva batería crea la batería pero no tiene flujo para agregar instrumentos manualmente después. Falta: botón "+ Agregar instrumento" en `[bateriaId]/page.tsx` que permita seleccionar del catálogo e informante.

### Media prioridad (mejoras de UX)
4. **Estado `aplicado`** — los formularios de captura siempre pasan a `puntuado`. Falta el estado intermedio `aplicado` (instrumento administrado pero sin puntajes aún).
5. **Cambio de estado de batería** — `estado_updated_at` y la lógica de transición entre estados (`en_curso` → `puntuacion_pendiente` → `borrador_informe`) no es automática. Hoy el estado solo cambia al generar el informe.
6. **WISC-V perfil de índices** (SVG horizontal) — el plan menciona una gráfica de barras horizontales con banda 85-115 sombreada para el perfil de índices WISC-V. No implementado; actualmente los puntajes se muestran solo en texto.
7. **Observaciones generales de la batería** — el campo `observaciones_generales` de `baterias_evaluacion` no tiene UI para editarlo.

### Baja prioridad / fase futura
8. **Normas de conversión CONNERS3/BRIEF2/CAARS2** — la conversión actual usa las tablas del `normas_conversion` solo para WISC-V (y de forma aproximada). Para CONNERS/BRIEF se confía en que Karen ingresa el T-score ya calculado del protocolo físico. Futuro: cargar tablas de normas reales y calcular T-score desde puntaje bruto.
9. **Estado `entregado`** — no hay acción UI que mueva la batería a `entregado` después de `firmado`.
10. **Resend email para batería firmada** — crear template de email similar al de notas.
11. **Búsqueda/filtro en lista de baterías** — actualmente sin filtros.
12. **`@react-pdf/renderer` en Vercel Edge** — verificar que el bundle funciona en producción serverless; puede necesitar `export const runtime = 'nodejs'` en `informe/actions.ts`.

---

## Comandos útiles

```bash
# Type check
npx tsc --noEmit

# Dev server
npm run dev

# Ver errores solo en archivos propios (excluir auth legacy)
npx tsc --noEmit 2>&1 | grep "src/app/dashboard\|src/lib\|src/types"
```

---

## Nota sobre errores TypeScript pre-existentes

Los archivos en `src/app/(auth)/` y `src/app/dashboard/NavLinks.tsx` tienen errores de TypeScript pre-existentes (módulos `next/navigation`, `next/headers`, CSS modules no encontrados). Son errores de configuración del entorno CI, no del código. **No tocar para no romper nada.**
