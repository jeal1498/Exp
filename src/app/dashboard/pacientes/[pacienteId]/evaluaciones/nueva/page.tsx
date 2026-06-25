import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { crearEvaluacion } from './actions'
import { DOMINIOS_COGNITIVOS, PRUEBAS_COMUNES } from '@/lib/evaluaciones/constants'
import styles from '../../../pacientes.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nueva Evaluación — Expedientes Clínicos' }

const DOMINIOS = DOMINIOS_COGNITIVOS

export default async function NuevaEvaluacionPage({
  params,
  searchParams,
}: {
  params: Promise<{ pacienteId: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { pacienteId } = await params
  const { error } = await searchParams
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('id, nombre, apellido_paterno')
    .eq('id', pacienteId)
    .eq('is_active', true)
    .single()

  const action = crearEvaluacion.bind(null, pacienteId)

  const nombrePaciente = paciente
    ? `${paciente.nombre} ${paciente.apellido_paterno}`
    : 'Paciente'

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
            <a href={`/dashboard/pacientes/${pacienteId}/evaluaciones`}>Evaluaciones</a>
          </li>
          <li className={styles.breadcrumbItem} aria-hidden="true">
            <span className={styles.breadcrumbSep}>›</span>
          </li>
          <li className={styles.breadcrumbItem} aria-current="page">
            Nueva
          </li>
        </ol>
      </nav>

      <h1 className={styles.pageTitle}>Nueva Evaluación Neuropsicológica</h1>

      {error && (
        <p role="alert" className={styles.alert}>
          {decodeURIComponent(error)}
        </p>
      )}

      <form action={action} className={styles.form}>
        <fieldset className={styles.fieldset}>
          <legend>Datos de la evaluación</legend>

          <div className={styles.fieldGroup}>
            <label className={styles.labelFor} htmlFor="fecha_evaluacion">
              Fecha de evaluación <span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              id="fecha_evaluacion"
              name="fecha_evaluacion"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.labelFor} htmlFor="nombre_prueba">
              Nombre de la prueba <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="nombre_prueba"
              name="nombre_prueba"
              list="pruebas-list"
              required
              placeholder="Ej. WAIS-IV, TMT-A…"
              className={styles.input}
            />
            <datalist id="pruebas-list">
              {PRUEBAS_COMUNES.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.labelFor} htmlFor="dominio">
              Dominio cognitivo <span className={styles.required}>*</span>
            </label>
            <select
              id="dominio"
              name="dominio"
              required
              defaultValue=""
              className={styles.select}
            >
              <option value="" disabled>— Seleccionar —</option>
              {DOMINIOS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.labelFor} htmlFor="puntaje_bruto">Puntaje bruto</label>
            <input
              type="number"
              id="puntaje_bruto"
              name="puntaje_bruto"
              step="any"
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.labelFor} htmlFor="percentil">
              Percentil <span className={styles.labelHint}>(0 – 100)</span>
            </label>
            <input
              type="number"
              id="percentil"
              name="percentil"
              min={0}
              max={100}
              step="any"
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.labelFor} htmlFor="puntuacion_estandar">Puntuación estándar</label>
            <input
              type="number"
              id="puntuacion_estandar"
              name="puntuacion_estandar"
              step="any"
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.labelFor} htmlFor="observaciones">Observaciones</label>
            <textarea
              id="observaciones"
              name="observaciones"
              rows={4}
              className={styles.textarea}
            />
          </div>
        </fieldset>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary}>Guardar evaluación</button>
          <a href={`/dashboard/pacientes/${pacienteId}/evaluaciones`} className={styles.btnGhost}>Cancelar</a>
        </div>
      </form>
    </div>
  )
}
