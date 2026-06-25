# Reporte de Verificación — Blueprint: Módulo de Baterías de Evaluación Neuropsicológica

**Fecha:** 2026-06-25  
**Proyecto Supabase:** `mxcmfhxnjcwoueqwvzyb` (psychocore)  
**Branch de trabajo:** `claude/verify-neuropsych-blueprint-ls8dwl`

---

## Verificación 1 — Archivo de constantes (fuente única de verdad)

| Estado | Ítem | Evidencia |
|--------|------|-----------|
| ❌ | `src/lib/evaluaciones/constants.ts` existe | El archivo no existe en esa ruta. Solo existe `src/lib/evaluaciones-constants.ts` (nombre y directorio distintos al especificado en el blueprint) |
| ⚠️ | Export `DOMINIOS_COGNITIVOS` (8 valores) | Existe como `DOMINIOS` (no `DOMINIOS_COGNITIVOS`) en `src/lib/evaluaciones-constants.ts:1` — 8 valores correctos |
| ✅ | Export `DOMINIOS_LABEL` | `src/lib/evaluaciones-constants.ts:14` — `Record<string, string>` con 8 entradas |
| ❌ | Export `TIPOS_BATERIA` | No existe en ningún archivo del proyecto |
| ❌ | Export `ESTADOS_BATERIA` | No existe en ningún archivo del proyecto |
| ❌ | Export `INFORMANTES` | No existe en ningún archivo del proyecto |
| ❌ | Export `INSTRUMENTOS_KAREN` (6 objetos) | No existe. Solo existe `PRUEBAS_COMUNES` (array de strings genérico, no objetos con metadatos) en `src/lib/evaluaciones-constants.ts:25` |
| ❌ | Export `BATERIAS_PREDEFINIDAS` | No existe en ningún archivo del proyecto |
| ❌ | Export `ADOS2_PUNTOS_CORTE` | No existe en ningún archivo del proyecto |
| ✅ | `evaluaciones/page.tsx` no tiene `DOMINIOS_LABEL` inline | `src/app/dashboard/pacientes/[pacienteId]/evaluaciones/page.tsx:5` — importa `DOMINIOS_LABEL` de `@/lib/evaluaciones-constants` |
| ✅ | `evaluaciones/nueva/page.tsx` no tiene `DOMINIOS` ni `PRUEBAS_COMUNES` inline | `src/app/dashboard/pacientes/[pacienteId]/evaluaciones/nueva/page.tsx:4` — importa ambos de `@/lib/evaluaciones-constants` |
| ✅ | `evaluaciones/nueva/actions.ts` no tiene `DOMINIOS_VALIDOS` hardcodeado | `src/app/dashboard/pacientes/[pacienteId]/evaluaciones/nueva/actions.ts:7` — `const DOMINIOS_VALIDOS: readonly string[] = DOMINIOS` (asignación desde import, no hardcode) |

**Resumen V1:** La refactorización de constantes legacy hacia la librería fue completada, pero la librería resultante tiene nombre/ruta incorrectos (`evaluaciones-constants.ts` vs `evaluaciones/constants.ts`) y le faltan 6 de los 8 exports requeridos por el blueprint.

---

## Verificación 2 — Base de datos: tablas nuevas

| Estado | Ítem | Evidencia |
|--------|------|-----------|
| ✅ | Tabla `instrumentos_catalogo` existe | `information_schema.tables` devuelve la fila |
| ✅ | Tabla `baterias_evaluacion` existe | `information_schema.tables` devuelve la fila |
| ✅ | Tabla `evaluacion_instrumento_detalle` existe | `information_schema.tables` devuelve la fila |
| ✅ | Tabla `normas_conversion` existe | `information_schema.tables` devuelve la fila |
| ✅ | ENUM `tipo_bateria` existe | `pg_type` confirma `tipo_bateria` |
| ✅ | ENUM `estado_bateria` existe | `pg_type` confirma `estado_bateria` |
| ✅ | ENUM `estado_instrumento` existe | `pg_type` confirma `estado_instrumento` |
| ✅ | 6 filas en `instrumentos_catalogo` | CONNERS3, BRIEF2, ADOS2, WISCV, CAARS2, CPT3 — query devuelve exactamente 6 filas |
| ✅ | `baterias_evaluacion.is_locked` | `information_schema.columns` confirma columna, `data_type: boolean, is_nullable: NO` |
| ✅ | `baterias_evaluacion.locked_at` | `information_schema.columns` confirma columna, `data_type: timestamp with time zone` |
| ✅ | `baterias_evaluacion.hash_integridad` | `information_schema.columns` confirma columna, `data_type: text` |
| ✅ | `baterias_evaluacion.informe_storage_path` | `information_schema.columns` confirma columna, `data_type: text` |
| ✅ | `baterias_evaluacion.informe_generado_at` | `information_schema.columns` confirma columna, `data_type: timestamp with time zone` |
| ✅ | `baterias_evaluacion.estado_updated_at` | `information_schema.columns` confirma columna, `data_type: timestamp with time zone, is_nullable: NO` |
| ✅ | `baterias_evaluacion.impresion_diagnostica` | `information_schema.columns` confirma columna (Fase 5) |
| ✅ | `baterias_evaluacion.recomendaciones` | `information_schema.columns` confirma columna (Fase 5) |
| ✅ | `evaluacion_instrumento_detalle` UNIQUE(bateria_id, instrumento_id, informante) | `pg_constraint` confirma `evaluacion_instrumento_detall_bateria_id_instrumento_id_inf_key` |

**Resumen V2:** La base de datos está completamente implementada según el blueprint. Las 4 tablas, 3 ENUMs, 6 semillas, todas las columnas de Fase 5 y la restricción UNIQUE están presentes.

---

## Verificación 3 — Base de datos: RLS y triggers

| Estado | Ítem | Evidencia |
|--------|------|-----------|
| ✅ | RLS habilitado en `instrumentos_catalogo` | `pg_tables`: `rowsecurity: true` |
| ✅ | RLS habilitado en `baterias_evaluacion` | `pg_tables`: `rowsecurity: true` |
| ✅ | RLS habilitado en `evaluacion_instrumento_detalle` | `pg_tables`: `rowsecurity: true` |
| ✅ | RLS habilitado en `normas_conversion` | `pg_tables`: `rowsecurity: true` |
| ✅ | `baterias_evaluacion`: política SELECT | `pg_policies`: `baterias_select, cmd: SELECT` |
| ✅ | `baterias_evaluacion`: política INSERT | `pg_policies`: `baterias_insert, cmd: INSERT` |
| ✅ | `baterias_evaluacion`: política UPDATE | `pg_policies`: `baterias_update, cmd: UPDATE` |
| ✅ | `baterias_evaluacion`: sin política DELETE | `pg_policies` no devuelve ninguna fila DELETE para esta tabla |
| ✅ | `evaluacion_instrumento_detalle`: política SELECT | `pg_policies`: `eid_select, cmd: SELECT` |
| ✅ | `evaluacion_instrumento_detalle`: política INSERT | `pg_policies`: `eid_insert, cmd: INSERT` |
| ✅ | `evaluacion_instrumento_detalle`: política UPDATE | `pg_policies`: `eid_update, cmd: UPDATE` |
| ✅ | `instrumentos_catalogo`: política SELECT (solo lectura) | `pg_policies`: `catalogo_select, cmd: SELECT` — sin INSERT/UPDATE/DELETE |
| ✅ | Trigger `trg_baterias_lock_guard` en `baterias_evaluacion` | `information_schema.triggers` confirma, `event_manipulation: UPDATE` |
| ✅ | Trigger `trg_audit_baterias` en `baterias_evaluacion` | `information_schema.triggers` confirma, cubre INSERT, UPDATE, DELETE |
| ✅ | Trigger `trg_audit_eid` en `evaluacion_instrumento_detalle` | `information_schema.triggers` confirma, cubre INSERT, UPDATE, DELETE |
| ✅ | Trigger `set_baterias_updated_at` en `baterias_evaluacion` | `information_schema.triggers` confirma, `event_manipulation: UPDATE` |
| ✅ | Trigger `set_eid_updated_at` en `evaluacion_instrumento_detalle` | `information_schema.triggers` confirma, `event_manipulation: UPDATE` |

**Resumen V3:** RLS y triggers completamente implementados. Las 4 tablas tienen RLS activo, las políticas siguen el patrón correcto (solo lectura para catálogos, sin DELETE para tablas clínicas), y los 5 triggers requeridos están presentes.

---

## Verificación 4 — Tipos TypeScript

| Estado | Ítem | Evidencia |
|--------|------|-----------|
| ❌ | Tipo para `baterias_evaluacion` (Row/Insert/Update) | `src/types/database.types.ts` — no existe. El archivo solo contiene: pacientes, anamnesis, evaluaciones_neuro, notas_evolucion, logs_auditoria |
| ❌ | Tipo para `instrumentos_catalogo` | `src/types/database.types.ts` — no existe |
| ❌ | Tipo para `evaluacion_instrumento_detalle` | `src/types/database.types.ts` — no existe |
| ❌ | ENUMs `tipo_bateria` y `estado_bateria` en los tipos | `src/types/database.types.ts:318` — solo existen `dominio_cognitivo` y `accion_auditoria` en la sección `Enums` |
| ❌ | Cero errores de compilación TypeScript | `npx tsc --noEmit` devuelve múltiples errores: `TS2307: Cannot find module 'next/headers'`, `TS2307: Cannot find module 'next/navigation'`, `TS7026: JSX element implicitly has type 'any'` — indicativo de que las dependencias de Next.js no están instaladas en el entorno CI, pero los errores existen independientemente de eso |

**Resumen V4:** Los tipos TypeScript no fueron actualizados para reflejar las nuevas tablas de base de datos. `database.types.ts` está desincronizado con el schema real de Supabase.

---

## Verificación 5 — Estructura de rutas nuevas (archivos)

| Estado | Ítem | Evidencia |
|--------|------|-----------|
| ❌ | `baterias/page.tsx` | No existe. `Glob('src/app/dashboard/pacientes/[pacienteId]/baterias/**/*')` devuelve cero resultados |
| ❌ | `baterias/nueva/page.tsx` | No existe |
| ❌ | `baterias/nueva/actions.ts` | No existe |
| ❌ | `baterias/[bateriaId]/page.tsx` | No existe |
| ❌ | `baterias/[bateriaId]/instrumentos/[detalleId]/page.tsx` | No existe |
| ❌ | `baterias/[bateriaId]/instrumentos/[detalleId]/actions.ts` | No existe |
| ❌ | `baterias/[bateriaId]/informe/page.tsx` | No existe |
| ❌ | `baterias/[bateriaId]/informe/actions.ts` | No existe |

**Resumen V5:** El módulo de rutas de baterías no fue implementado. Los 7 archivos requeridos (incluyendo `page.tsx` raíz como 8vo) no existen en el repositorio.

---

## Verificación 6 — Server Actions: firmas y flujo

| Estado | Ítem | Evidencia |
|--------|------|-----------|
| ❌ | `crearBateria(pacienteId, formData)` existe | Archivo `baterias/nueva/actions.ts` no existe |
| ❌ | Crea fila en `baterias_evaluacion` | No implementado |
| ❌ | Inserta en `evaluacion_instrumento_detalle` según `BATERIAS_PREDEFINIDAS` | No implementado |
| ❌ | Llama a `insertAuditLog` | No implementado |
| ❌ | Hace `redirect` al final | No implementado |
| ❌ | `guardarPuntajes(detalleId, formData)` existe | Archivo `baterias/[bateriaId]/instrumentos/[detalleId]/actions.ts` no existe |
| ❌ | Valida rango de puntajes T (20-100) manualmente | No implementado |
| ❌ | UPDATE en `evaluacion_instrumento_detalle` + estado 'puntuado' | No implementado |
| ❌ | `generarInforme(bateriaId)` existe | Archivo `baterias/[bateriaId]/informe/actions.ts` no existe |
| ❌ | `firmarBateria(bateriaId)` existe | No implementado |
| ❌ | `firmarBateria` calcula SHA-256 + `is_locked = true` | No implementado |
| ❌ | `firmarBateria` cambia estado a 'firmado' | No implementado |

**Resumen V6:** Ninguna de las 3 familias de server actions fue implementada.

---

## Verificación 7 — Formularios por instrumento

| Estado | Ítem | Evidencia |
|--------|------|-----------|
| ❌ | Página `baterias/[bateriaId]/instrumentos/[detalleId]/page.tsx` existe | Archivo no existe |
| ❌ | Formulario condicional por `instrumento.codigo` | No implementado |
| ❌ | Formulario CONNERS-3 con escalas (inatención, hiper/impulsividad, FE, agresión, etc.) | No implementado |
| ❌ | Formulario BRIEF-2 con 9 escalas clínicas + 4 índices (BRI, ERI, CRI, GEC) | No implementado |
| ❌ | Formulario ADOS-2 con selector de módulo 1-4 + SA, RRB, total, CSS | No implementado |
| ❌ | Formulario WISC-V con 10 subpruebas core (puntaje escalar 1-19) | No implementado |
| ❌ | Campo `nombre_informante` condicional (padre/madre/maestro) | No implementado |

**Resumen V7:** El módulo de formularios por instrumento no fue implementado en absoluto.

---

## Verificación 8 — PDF

| Estado | Ítem | Evidencia |
|--------|------|-----------|
| ❌ | `@react-pdf/renderer` en `dependencies` de `package.json` | `package.json:11-18` — solo contiene `@supabase/ssr`, `@supabase/supabase-js`, `next`, `react`, `react-dom`, `resend` |
| ❌ | Archivo `src/lib/pdf/InformeNeuropsicologico.tsx` existe | `Glob('src/lib/pdf/**/*')` devuelve cero resultados |
| ❌ | Componente con secciones: encabezado Karen Trujillo, cédula, datos paciente, etc. | No existe el archivo |
| ❌ | `generarInforme` sube PDF a Supabase Storage bucket `reportes-escaneados` | No existe la función |

**Resumen V8:** La generación de PDF no fue implementada. Ni la dependencia, ni el componente, ni la integración con Storage.

---

## Verificación 9 — Navegación e integración con expediente

| Estado | Ítem | Evidencia |
|--------|------|-----------|
| ❌ | `paciente/[pacienteId]/page.tsx` muestra sección de baterías con enlace a `/baterias` | `src/app/dashboard/pacientes/[pacienteId]/page.tsx:124-149` — `moduleList` tiene solo 3 ítems: Evaluaciones Neuropsicológicas, Notas de Evolución (SOAP), Documentos Adjuntos. No hay enlace a `/baterias` |
| ✅ | `baterias/page.tsx` hace `insertAuditLog` para SELECT | N/A — el archivo no existe; pero `evaluaciones/page.tsx:51` sí hace `insertAuditLog` para SELECT en evaluaciones (el módulo legacy cumple NOM-024) |
| ✅ | Los archivos legacy de `evaluaciones/` siguen funcionando | `git log` confirma que los 5 commits en `evaluaciones/` son de refactorización de diseño y constantes, no de ruptura funcional. Los archivos leen y escriben correctamente |
| ⚠️ | Sin commits nuevos en `evaluaciones/` (solo refactor de constantes de Fase 1) | `git log` muestra 5 commits en `evaluaciones/`: además de la refactorización de constantes (`cf3aa10`), hay migración al design system (`7113b9d`, `67c0139`), corrección de tipos (`3573fa4`) y módulo inicial (`69d9ef8`) — hay más modificaciones que las esperadas en Fase 1 |

**Resumen V9:** El expediente del paciente no fue integrado con el módulo de baterías. El enlace de navegación a `/baterias` falta en la página principal del paciente.

---

## Verificación 10 — Restricciones que NO deben haberse violado

Dado que los archivos `baterias/` no existen, las búsquedas de patrones prohibidos se aplican al codebase existente como referencia de estado.

| Estado | Ítem | Evidencia |
|--------|------|-----------|
| ✅ | Cero ocurrencias de ORM (Prisma/Drizzle) en baterias/ | Directorio `baterias/` no existe — no hay código con ORM |
| ✅ | Cero ocurrencias de react-hook-form / Formik en baterias/ | Directorio `baterias/` no existe — no hay formularios con estas librerías |
| ✅ | Cero ocurrencias de Zod en baterias/ | Directorio `baterias/` no existe |
| ✅ | Cero ocurrencias de `<Link>` de Next.js en baterias/ | Directorio `baterias/` no existe; archivos legacy usan `<a href>` nativo |
| ✅ | Cero clases Tailwind en baterias/ | Directorio `baterias/` no existe; archivos legacy usan CSS Modules |

**Nota:** La verificación de restricciones es vacuamente verdadera porque el módulo no fue implementado. No puede violarse una restricción en código que no existe.

---

## Resumen Ejecutivo

| Verificación | Estado General | Ítems ✅ | Ítems ⚠️ | Ítems ❌ |
|---|---|---|---|---|
| 1 — Constantes | ⚠️ Parcial | 3 | 1 | 8 |
| 2 — Tablas DB | ✅ Completo | 16 | 0 | 0 |
| 3 — RLS y Triggers | ✅ Completo | 17 | 0 | 0 |
| 4 — Tipos TypeScript | ❌ Faltante | 0 | 0 | 5 |
| 5 — Rutas (archivos) | ❌ Faltante | 0 | 0 | 8 |
| 6 — Server Actions | ❌ Faltante | 0 | 0 | 12 |
| 7 — Formularios | ❌ Faltante | 0 | 0 | 5 |
| 8 — PDF | ❌ Faltante | 0 | 0 | 4 |
| 9 — Navegación | ⚠️ Parcial | 2 | 1 | 1 |
| 10 — Restricciones | ✅ (vacuo) | 5 | 0 | 0 |
| **TOTAL** | | **43** | **2** | **43** |

### Diagnóstico

La implementación está **completamente parada después de la migración de base de datos**. Las fases de infraestructura (schema, ENUMs, RLS, triggers, semillas) fueron ejecutadas correctamente. Sin embargo, **todo el código de aplicación** (rutas, server actions, formularios, PDF, tipos TS, navegación) está pendiente.

**Fases completadas:**
- Fase DB (migrations): ✅ 100%
- Fase legacy-constants refactor: ⚠️ ~40% (ruta/nombre incorrectos, exports incompletos)

**Fases no iniciadas:**
- Fase rutas Next.js: 0%
- Fase server actions: 0%
- Fase formularios por instrumento: 0%
- Fase PDF: 0%
- Fase tipos TypeScript: 0%
- Fase integración expediente: 0%
