import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/supabase/audit'
import { guardarPuntajes } from './actions'
import { formatFecha } from '@/lib/format'
import { INFORMANTE_LABEL } from '@/lib/evaluaciones/constants'
import type { Informante } from '@/lib/evaluaciones/constants'
import type { Json } from '@/types/database.types'
import styles from '../../../../../../pacientes.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Capturar Puntajes — Expedientes Clínicos' }

function NumField({
  name, label, hint, required: req, min, max, defaultValue
}: {
  name: string
  label: string
  hint?: string
  required?: boolean
  min?: number
  max?: number
  defaultValue?: number | null
}) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.labelFor} htmlFor={name}>
        {label}
        {req && <span className={styles.required}> *</span>}
        {hint && <span className={styles.labelHint}> ({hint})</span>}
      </label>
      <input
        type="number"
        id={name}
        name={name}
        min={min}
        max={max}
        step="1"
        required={req}
        defaultValue={defaultValue ?? undefined}
        className={styles.input}
        style={{ maxWidth: '120px' }}
      />
    </div>
  )
}

function TScoreField({ name, label, required: req, defaultValue }: {
  name: string; label: string; required?: boolean; defaultValue?: number | null
}) {
  return <NumField name={name} label={label} hint="T-score 20-100" required={req} min={20} max={100} defaultValue={defaultValue} />
}

function ScalarField({ name, label, required: req, defaultValue }: {
  name: string; label: string; required?: boolean; defaultValue?: number | null
}) {
  return <NumField name={name} label={label} hint="escalar 1-19" required={req} min={1} max={19} defaultValue={defaultValue} />
}

export default async function InstrumentoDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ pacienteId: string; bateriaId: string; detalleId: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { pacienteId, bateriaId, detalleId } = await params
  const { error } = await searchParams
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const { data: detalle, error: detalleError } = await supabase
    .from('evaluacion_instrumento_detalle')
    .select('*')
    .eq('id', detalleId)
    .single()

  if (detalleError || !detalle) redirect(`/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}`)

  const { data: instrumento } = await supabase
    .from('instrumentos_catalogo')
    .select('codigo, nombre_completo, nombre_corto')
    .eq('id', detalle.instrumento_id)
    .single()

  const { data: bateria } = await supabase
    .from('baterias_evaluacion')
    .select('id, is_locked')
    .eq('id', bateriaId)
    .single()

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('id, nombre, apellido_paterno')
    .eq('id', pacienteId)
    .single()

  await insertAuditLog(supabase, {
    usuario_id: userData.user.id,
    tabla_afectada: 'evaluacion_instrumento_detalle',
    registro_id: detalleId,
    accion: 'SELECT',
    datos_nuevos: { bateria_id: bateriaId },
  })

  const action = guardarPuntajes.bind(null, pacienteId, bateriaId, detalleId)

  const nombrePaciente = paciente
    ? `${paciente.nombre} ${paciente.apellido_paterno}`
    : 'Paciente'

  const codigo = instrumento?.codigo ?? ''
  const informante = detalle.informante as Informante
  const isLocked = bateria?.is_locked ?? false

  const puntajes = detalle.puntajes_estandar as Record<string, unknown> | null
  const brutos = detalle.puntajes_brutos as Record<string, unknown> | null

  function defT(key: string): number | null {
    const v = puntajes?.[key]
    return typeof v === 'number' ? v : null
  }

  function defN(key: string): number | null {
    const v = brutos?.[key] ?? puntajes?.[key]
    return typeof v === 'number' ? v : null
  }

  return (
    <div>
      <nav aria-label="Migas de pan" className={styles.breadcrumb}>
        <ol className={styles.breadcrumbList}>
          <li className={styles.breadcrumbItem}>
            <a href="/dashboard/pacientes">Pacientes</a>
          </li>
          <li className={styles.breadcrumbItem} aria-hidden="true">
            <span className={styles.breadcrumbSep}>›</span>
          </li>
          <li className={styles.breadcrumbItem}>
            <a href={`/dashboard/pacientes/${pacienteId}`}>{nombrePaciente}</a>
          </li>
          <li className={styles.breadcrumbItem} aria-hidden="true">
            <span className={styles.breadcrumbSep}>›</span>
          </li>
          <li className={styles.breadcrumbItem}>
            <a href={`/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}`}>Batería</a>
          </li>
          <li className={styles.breadcrumbItem} aria-hidden="true">
            <span className={styles.breadcrumbSep}>›</span>
          </li>
          <li className={styles.breadcrumbItem} aria-current="page">
            {instrumento?.nombre_corto ?? 'Instrumento'}
          </li>
        </ol>
      </nav>

      <h1 className={styles.pageTitle}>
        {instrumento?.nombre_corto ?? codigo}
        {' — '}
        {INFORMANTE_LABEL[informante] ?? informante}
      </h1>
      <p style={{ fontSize: '0.85rem', color: 'oklch(0.500 0.000 0)', marginBottom: '1.5rem' }}>
        {instrumento?.nombre_completo}
      </p>

      {error && (
        <p role="alert" className={styles.alert}>
          {decodeURIComponent(error)}
        </p>
      )}

      {isLocked && (
        <p className={styles.alert}>
          Esta batería está firmada y bloqueada. No se pueden modificar los puntajes.
        </p>
      )}

      {/* Show existing results if already scored */}
      {puntajes && (
        <details style={{ marginBottom: '1.5rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'oklch(0.430 0.155 250)' }}>
            Ver puntajes actuales
          </summary>
          <dl className={styles.metaList} style={{ marginTop: '0.75rem' }}>
            {Object.entries(puntajes).map(([k, v]) => (
              <div key={k} style={{ display: 'contents' }}>
                <dt className={styles.metaLabel}>{k}</dt>
                <dd className={`${styles.metaValue} ${styles.metaValueMono}`}>{String(v)}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}

      {!isLocked && (
        <form action={action} className={styles.form}>

          {/* Common fields */}
          <fieldset className={styles.fieldset}>
            <legend>Datos de aplicación</legend>

            {['padre', 'madre', 'maestro'].includes(informante) && (
              <div className={styles.fieldGroup}>
                <label className={styles.labelFor} htmlFor="nombre_informante">
                  Nombre del informante <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="nombre_informante"
                  name="nombre_informante"
                  required
                  placeholder="Ej. Sra. López (maestra 4° grado)"
                  className={styles.input}
                  defaultValue={detalle.nombre_informante ?? undefined}
                />
              </div>
            )}

            <div className={styles.fieldGroup}>
              <label className={styles.labelFor} htmlFor="fecha_aplicacion">Fecha de aplicación</label>
              <input
                type="date"
                id="fecha_aplicacion"
                name="fecha_aplicacion"
                className={styles.input}
                defaultValue={detalle.fecha_aplicacion ?? undefined}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.labelFor} htmlFor="duracion_minutos">
                Duración <span className={styles.labelHint}>(minutos)</span>
              </label>
              <input
                type="number"
                id="duracion_minutos"
                name="duracion_minutos"
                min={1}
                max={480}
                className={styles.input}
                style={{ maxWidth: '120px' }}
                defaultValue={detalle.duracion_minutos ?? undefined}
              />
            </div>
          </fieldset>

          {/* ── CONNERS-3 ── */}
          {codigo === 'CONNERS3' && (
            <fieldset className={styles.fieldset}>
              <legend>Puntajes T — CONNERS-3</legend>
              <p className={styles.labelHint} style={{ marginBottom: '1rem' }}>
                Ingrese los T-scores del protocolo físico. Rango válido: 20–100.
              </p>
              <TScoreField name="inatención" label="Inatención" required defaultValue={defT('inatención')} />
              <TScoreField name="hiperactividad_impulsividad" label="Hiperactividad/Impulsividad" required defaultValue={defT('hiperactividad_impulsividad')} />
              {informante !== 'autoinforme' && (
                <TScoreField name="problemas_aprendizaje" label="Problemas de Aprendizaje" required defaultValue={defT('problemas_aprendizaje')} />
              )}
              <TScoreField name="funcionamiento_ejecutivo" label="Funcionamiento Ejecutivo" required defaultValue={defT('funcionamiento_ejecutivo')} />
              <TScoreField name="agresión" label="Agresión" required defaultValue={defT('agresión')} />
              {informante !== 'maestro' && (
                <TScoreField name="relaciones_pares" label="Relaciones con Pares" required defaultValue={defT('relaciones_pares')} />
              )}
              <TScoreField name="indice_tdah" label="Índice TDAH" required defaultValue={defT('indice_tdah')} />
              <TScoreField name="dsm5_inatento" label="DSM-5 Inatento" required defaultValue={defT('dsm5_inatento')} />
              <TScoreField name="dsm5_hiperactivo" label="DSM-5 Hiperactivo-Impulsivo" required defaultValue={defT('dsm5_hiperactivo')} />
              <hr style={{ border: 'none', borderTop: '1px solid oklch(0.900 0.000 0)', margin: '1rem 0' }} />
              <p style={{ fontSize: '0.85rem', color: 'oklch(0.500 0.000 0)', marginBottom: '0.5rem' }}>Escalas de validez (opcional)</p>
              <TScoreField name="indice_inconsistencia" label="Índice de Inconsistencia" defaultValue={defT('indice_inconsistencia')} />
              <TScoreField name="indice_impresion_positiva" label="Índice de Impresión Positiva" defaultValue={defT('indice_impresion_positiva')} />
              <TScoreField name="indice_impresion_negativa" label="Índice de Impresión Negativa" defaultValue={defT('indice_impresion_negativa')} />
            </fieldset>
          )}

          {/* ── BRIEF-2 ── */}
          {codigo === 'BRIEF2' && (
            <fieldset className={styles.fieldset}>
              <legend>Puntajes T — BRIEF-2</legend>
              <p className={styles.labelHint} style={{ marginBottom: '1rem' }}>
                Umbral clínico T≥65. Ingrese los T-scores del protocolo.
              </p>
              <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'oklch(0.350 0.000 0)' }}>Escalas clínicas</p>
              <TScoreField name="inhibicion" label="Inhibición" required defaultValue={defT('inhibicion')} />
              <TScoreField name="supervision_conducta" label="Supervisión de Conducta" required defaultValue={defT('supervision_conducta')} />
              <TScoreField name="flexibilidad" label="Flexibilidad" required defaultValue={defT('flexibilidad')} />
              <TScoreField name="control_emocional" label="Control Emocional" required defaultValue={defT('control_emocional')} />
              <TScoreField name="cambio" label="Cambio" required defaultValue={defT('cambio')} />
              <TScoreField name="iniciativa" label="Iniciativa" required defaultValue={defT('iniciativa')} />
              <TScoreField name="memoria_trabajo" label="Memoria de Trabajo" required defaultValue={defT('memoria_trabajo')} />
              <TScoreField name="planificacion_organizacion" label="Planificación y Organización" required defaultValue={defT('planificacion_organizacion')} />
              <TScoreField name="organizacion_materiales" label="Organización de Materiales" required defaultValue={defT('organizacion_materiales')} />
              <TScoreField name="monitoreo" label="Monitoreo" required defaultValue={defT('monitoreo')} />
              <hr style={{ border: 'none', borderTop: '1px solid oklch(0.900 0.000 0)', margin: '1rem 0' }} />
              <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'oklch(0.350 0.000 0)' }}>Índices compuestos</p>
              <TScoreField name="BRI" label="BRI — Behavioral Regulation Index" required defaultValue={defT('BRI')} />
              <TScoreField name="ERI" label="ERI — Emotion Regulation Index" required defaultValue={defT('ERI')} />
              <TScoreField name="CRI" label="CRI — Cognitive Regulation Index" required defaultValue={defT('CRI')} />
              <TScoreField name="GEC" label="GEC — Global Executive Composite" required defaultValue={defT('GEC')} />
              <hr style={{ border: 'none', borderTop: '1px solid oklch(0.900 0.000 0)', margin: '1rem 0' }} />
              <p style={{ fontSize: '0.85rem', color: 'oklch(0.500 0.000 0)', marginBottom: '0.5rem' }}>Escalas de validez (opcional)</p>
              <TScoreField name="inconsistencia" label="Inconsistencia" defaultValue={defT('inconsistencia')} />
              <TScoreField name="negatividad" label="Negatividad" defaultValue={defT('negatividad')} />
              <TScoreField name="magnitud" label="Magnitud" defaultValue={defT('magnitud')} />
            </fieldset>
          )}

          {/* ── ADOS-2 ── */}
          {codigo === 'ADOS2' && (
            <fieldset className={styles.fieldset}>
              <legend>Scores del Algoritmo — ADOS-2</legend>
              <p className={styles.labelHint} style={{ marginBottom: '1rem' }}>
                Transcriba los totales del protocolo físico. La clasificación se calculará automáticamente.
              </p>

              <div className={styles.fieldGroup}>
                <label className={styles.labelFor} htmlFor="modulo">
                  Módulo <span className={styles.required}>*</span>
                </label>
                <select
                  id="modulo"
                  name="modulo"
                  required
                  className={styles.select}
                  defaultValue={String(defN('modulo') ?? '')}
                >
                  <option value="" disabled>— Seleccionar —</option>
                  <option value="1">Módulo 1 — Sin lenguaje o palabras sueltas</option>
                  <option value="2">Módulo 2 — Frases pero no conversación fluida</option>
                  <option value="3">Módulo 3 — Lenguaje fluido, niños/adolescentes (≤16)</option>
                  <option value="4">Módulo 4 — Lenguaje fluido, adultos (16+)</option>
                </select>
              </div>

              <NumField name="social_affect_total" label="SA Total (Social Affect)" required min={0} max={50} defaultValue={defN('social_affect_total')} />
              <NumField name="rrb_total" label="RRB Total (Restricted/Repetitive Behaviors)" hint="no aplica Módulo 4" min={0} max={20} defaultValue={defN('rrb_total')} />
              <NumField name="total_algoritmo" label="Total del Algoritmo" required min={0} max={70} defaultValue={defN('total_algoritmo')} />

              <hr style={{ border: 'none', borderTop: '1px solid oklch(0.900 0.000 0)', margin: '1rem 0' }} />
              <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'oklch(0.350 0.000 0)' }}>Calibrated Severity Scores (CSS)</p>

              <NumField name="css_total" label="CSS Total" required hint="1-10" min={1} max={10} defaultValue={defN('css_total')} />
              <NumField name="css_social_affect" label="CSS Social Affect" required hint="1-10" min={1} max={10} defaultValue={defN('css_social_affect')} />
              <NumField name="css_rrb" label="CSS RRB" hint="1-10, no aplica Módulo 4" min={1} max={10} defaultValue={defN('css_rrb')} />

              <NumField name="duracion_sesion_minutos" label="Duración de la sesión" hint="minutos" min={1} max={480} defaultValue={defN('duracion_sesion_minutos')} />
            </fieldset>
          )}

          {/* ── WISC-V ── */}
          {codigo === 'WISCV' && (
            <fieldset className={styles.fieldset}>
              <legend>Puntajes Escalares — WISC-V</legend>
              <p className={styles.labelHint} style={{ marginBottom: '1rem' }}>
                Ingrese los puntajes escalares de cada subprueba (1–19). Los índices compuestos se calcularán automáticamente.
              </p>
              <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'oklch(0.350 0.000 0)' }}>VCI — Comprensión Verbal</p>
              <ScalarField name="semejanzas" label="Semejanzas" defaultValue={defN('semejanzas')} />
              <ScalarField name="vocabulario" label="Vocabulario" defaultValue={defN('vocabulario')} />
              <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: '0.75rem 0 0.5rem', color: 'oklch(0.350 0.000 0)' }}>VSI — Visuoespacial</p>
              <ScalarField name="diseno_cubos" label="Diseño con Cubos" defaultValue={defN('diseno_cubos')} />
              <ScalarField name="matrices" label="Matrices" defaultValue={defN('matrices')} />
              <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: '0.75rem 0 0.5rem', color: 'oklch(0.350 0.000 0)' }}>FRI — Razonamiento Fluido</p>
              <ScalarField name="conceptos_figuras" label="Conceptos con Figuras" defaultValue={defN('conceptos_figuras')} />
              <ScalarField name="balanzas" label="Balanzas" defaultValue={defN('balanzas')} />
              <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: '0.75rem 0 0.5rem', color: 'oklch(0.350 0.000 0)' }}>WMI — Memoria de Trabajo</p>
              <ScalarField name="retencion_digitos" label="Retención de Dígitos" defaultValue={defN('retencion_digitos')} />
              <ScalarField name="secuencia_letras_numeros" label="Secuencia de Letras y Números" defaultValue={defN('secuencia_letras_numeros')} />
              <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: '0.75rem 0 0.5rem', color: 'oklch(0.350 0.000 0)' }}>PSI — Velocidad de Procesamiento</p>
              <ScalarField name="busqueda_simbolos" label="Búsqueda de Símbolos" defaultValue={defN('busqueda_simbolos')} />
              <ScalarField name="claves" label="Claves" defaultValue={defN('claves')} />
            </fieldset>
          )}

          {/* ── CAARS-2 ── */}
          {codigo === 'CAARS2' && (
            <fieldset className={styles.fieldset}>
              <legend>Puntajes T — CAARS-2</legend>
              <p className={styles.labelHint} style={{ marginBottom: '1rem' }}>
                Ingrese los T-scores del protocolo físico. Rango válido: 20–100.
              </p>
              <TScoreField name="inatención" label="Inatención" required defaultValue={defT('inatención')} />
              <TScoreField name="hiperactividad_impulsividad" label="Hiperactividad/Impulsividad" required defaultValue={defT('hiperactividad_impulsividad')} />
              <TScoreField name="problemas_autoconcepto" label="Problemas con el Autoconcepto" defaultValue={defT('problemas_autoconcepto')} />
              <hr style={{ border: 'none', borderTop: '1px solid oklch(0.900 0.000 0)', margin: '1rem 0' }} />
              <TScoreField name="dsm5_inatento" label="DSM-5 Inatento" required defaultValue={defT('dsm5_inatento')} />
              <TScoreField name="dsm5_hiperactivo" label="DSM-5 Hiperactivo-Impulsivo" required defaultValue={defT('dsm5_hiperactivo')} />
              <TScoreField name="dsm5_total" label="DSM-5 Total" required defaultValue={defT('dsm5_total')} />
              <hr style={{ border: 'none', borderTop: '1px solid oklch(0.900 0.000 0)', margin: '1rem 0' }} />
              <p style={{ fontSize: '0.85rem', color: 'oklch(0.500 0.000 0)', marginBottom: '0.5rem' }}>Índices de validez (opcional)</p>
              <TScoreField name="indice_inconsistencia" label="Índice de Inconsistencia" defaultValue={defT('indice_inconsistencia')} />
              <TScoreField name="indice_impresion_positiva" label="Índice de Impresión Positiva" defaultValue={defT('indice_impresion_positiva')} />
              <TScoreField name="indice_negativa_exagerada" label="Índice de Respuesta Negativa/Exagerada" defaultValue={defT('indice_negativa_exagerada')} />
            </fieldset>
          )}

          {/* ── CPT-3 ── */}
          {codigo === 'CPT3' && (
            <fieldset className={styles.fieldset}>
              <legend>Puntajes T — CPT-3</legend>
              <p className={styles.labelHint} style={{ marginBottom: '1rem' }}>
                Ingrese los T-scores del reporte CPT-3 importado. Rango válido: 20–100.
              </p>
              <TScoreField name="omisiones" label="Omisiones" defaultValue={defT('omisiones')} />
              <TScoreField name="comisiones" label="Comisiones" defaultValue={defT('comisiones')} />
              <TScoreField name="perseveraciones" label="Perseveraciones" defaultValue={defT('perseveraciones')} />
              <TScoreField name="TR" label="Tiempo de Reacción (TR)" defaultValue={defT('TR')} />
              <TScoreField name="variabilidad_TR" label="Variabilidad del TR" defaultValue={defT('variabilidad_TR')} />
              <TScoreField name="detectabilidad" label="Detectabilidad (d')" defaultValue={defT('detectabilidad')} />
              <TScoreField name="respuesta_anticipada" label="Respuesta Anticipada" defaultValue={defT('respuesta_anticipada')} />
              <TScoreField name="variabilidad_entre_bloques" label="Variabilidad Entre Bloques" defaultValue={defT('variabilidad_entre_bloques')} />
              <TScoreField name="indice_ADHD" label="Índice ADHD" defaultValue={defT('indice_ADHD')} />
              <TScoreField name="confianza_inhibicion" label="Confianza en Inhibición" defaultValue={defT('confianza_inhibicion')} />
            </fieldset>
          )}

          {/* Observaciones */}
          <fieldset className={styles.fieldset}>
            <legend>Observaciones conductuales</legend>
            <div className={styles.fieldGroup}>
              <label className={styles.labelFor} htmlFor="observaciones_conductuales">
                Observaciones durante la aplicación <span className={styles.labelHint}>(opcional)</span>
              </label>
              <textarea
                id="observaciones_conductuales"
                name="observaciones_conductuales"
                rows={4}
                className={styles.textarea}
                defaultValue={detalle.observaciones_conductuales ?? undefined}
              />
            </div>
          </fieldset>

          <div className={styles.formActions}>
            <button type="submit" className={styles.btnPrimary}>Guardar puntajes</button>
            <a
              href={`/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}`}
              className={styles.btnGhost}
            >
              Cancelar
            </a>
          </div>
        </form>
      )}

      <a href={`/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}`} className={styles.backLink}>
        <span aria-hidden="true">←</span>
        <span>Volver a la batería</span>
      </a>
    </div>
  )
}
