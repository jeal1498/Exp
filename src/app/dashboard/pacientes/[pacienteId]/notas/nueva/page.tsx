import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { crearNota } from './actions'
import styles from '../../../pacientes.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nueva Nota de Evolución — Expedientes Clínicos' }

const CIE11_CODES = [
  { codigo: '6D70', descripcion: 'Demencia debida a enfermedad de Alzheimer' },
  { codigo: '6D71', descripcion: 'Demencia vascular' },
  { codigo: '6D72', descripcion: 'Demencia debida a enfermedad de cuerpos de Lewy' },
  { codigo: '6D80', descripcion: 'Deterioro cognitivo leve' },
  { codigo: '6A00', descripcion: 'Trastorno por déficit de atención con hiperactividad (TDAH)' },
  { codigo: '6A02', descripcion: 'Trastorno del espectro autista' },
  { codigo: '6A20', descripcion: 'Esquizofrenia' },
  { codigo: '6A70', descripcion: 'Trastorno depresivo recurrente' },
  { codigo: '6B00', descripcion: 'Trastorno de ansiedad generalizada' },
  { codigo: '6B43', descripcion: 'Trastorno de estrés postraumático (TEPT)' },
  { codigo: '6C40', descripcion: 'Trastorno por consumo de alcohol' },
  { codigo: '6D10', descripcion: 'Amnesia disociativa' },
  { codigo: 'MB21', descripcion: 'Traumatismo craneoencefálico' },
  { codigo: '8A00', descripcion: 'Epilepsia' },
  { codigo: '8A20', descripcion: 'Migraña' },
]

export default async function NuevaNotaPage({
  params,
  searchParams,
}: {
  params: Promise<{ pacienteId: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { pacienteId } = await params
  const sp = await searchParams

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('id, nombre, apellido_paterno')
    .eq('id', pacienteId)
    .eq('is_active', true)
    .single()

  const nombrePaciente = paciente
    ? `${paciente.nombre} ${paciente.apellido_paterno}`
    : 'Paciente'

  const crearNotaBound = crearNota.bind(null, pacienteId)

  const defaultFecha = new Date().toISOString().slice(0, 16)

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
            <a href={`/dashboard/pacientes/${pacienteId}/notas`}>Notas de Evolución</a>
          </li>
          <li className={styles.breadcrumbItem} aria-hidden="true">
            <span className={styles.breadcrumbSep}>›</span>
          </li>
          <li className={styles.breadcrumbItem} aria-current="page">
            Nueva Nota
          </li>
        </ol>
      </nav>

      <h1 className={styles.pageTitle}>Nueva Nota de Evolución</h1>
      <p className={styles.helperText}>
        Campos marcados con <abbr title="obligatorio"><span className={styles.required}>*</span></abbr> son requeridos.
        Al menos un campo SOAP debe completarse.
      </p>

      {sp.error && (
        <p role="alert" className={styles.alert}>
          {decodeURIComponent(sp.error)}
        </p>
      )}

      <form action={crearNotaBound} className={styles.form}>
        <fieldset className={styles.fieldset}>
          <legend>Fecha y diagnóstico</legend>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>Fecha y hora de la nota <span className={styles.required}>*</span> <span className={styles.labelHint}>(hora en zona local de México)</span></span>
              <input
                type="datetime-local"
                name="fecha_nota"
                required
                defaultValue={defaultFecha}
                className={styles.input}
              />
            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>Código CIE-11</span>
              <input
                type="text"
                name="codigo_cie11"
                list="cie11-codigos"
                placeholder="Ej. 6D80"
                className={`${styles.inputMono} ${styles.inputNarrow}`}
              />
              <datalist id="cie11-codigos">
                {CIE11_CODES.map((c) => (
                  <option key={c.codigo} value={c.codigo} />
                ))}
              </datalist>
            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>Descripción diagnóstica (CIE-11)</span>
              <input
                type="text"
                name="descripcion_cie11"
                list="cie11-descripciones"
                placeholder="Descripción del diagnóstico"
                className={styles.input}
              />
              <datalist id="cie11-descripciones">
                {CIE11_CODES.map((c) => (
                  <option key={c.codigo} value={c.descripcion} />
                ))}
              </datalist>
            </label>
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>Nota SOAP (NOM-004 §8) — complete al menos un campo</legend>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>S — Subjetivo <span className={styles.labelHint}>(motivo de consulta, síntomas referidos por el paciente)</span></span>
              <textarea name="subjetivo" rows={4} maxLength={2000} className={styles.textarea} />
            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>O — Objetivo <span className={styles.labelHint}>(hallazgos observables, resultados de pruebas, signos)</span></span>
              <textarea name="objetivo" rows={4} maxLength={2000} className={styles.textarea} />
            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>A — Análisis <span className={styles.labelHint}>(interpretación clínica, diagnóstico, razonamiento)</span></span>
              <textarea name="analisis" rows={4} maxLength={2000} className={styles.textarea} />
            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>P — Plan <span className={styles.labelHint}>(intervenciones, seguimiento, indicaciones)</span></span>
              <textarea name="plan" rows={4} maxLength={2000} className={styles.textarea} />
            </label>
          </div>
        </fieldset>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary}>Guardar nota</button>
          <a href={`/dashboard/pacientes/${pacienteId}/notas`} className={styles.btnGhost}>Cancelar</a>
        </div>
      </form>
    </div>
  )
}
