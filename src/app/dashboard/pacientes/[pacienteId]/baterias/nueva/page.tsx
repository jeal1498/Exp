import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { crearBateria } from './actions'
import { BATERIAS_PREDEFINIDAS, INSTRUMENTOS_KAREN } from '@/lib/evaluaciones/constants'
import styles from '../../../pacientes.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nueva Batería — Expedientes Clínicos' }

const TIPO_OPTIONS = [
  { value: 'tdah_nino',    label: 'TDAH Infantil (6–17 años)' },
  { value: 'tdah_adulto',  label: 'TDAH Adulto (18+ años)' },
  { value: 'tea',          label: 'Evaluación TEA / Autismo' },
  { value: 'personalizada', label: 'Batería personalizada' },
] as const

const INFORMANTE_LABELS: Record<string, string> = {
  karen:       'Karen (clínico)',
  padre:       'Padre',
  madre:       'Madre',
  maestro:     'Maestro',
  autoinforme: 'Autoinforme',
  observador:  'Observador',
}

function getNombreCorto(codigo: string): string {
  return INSTRUMENTOS_KAREN.find(i => i.codigo === codigo)?.nombre_corto ?? codigo
}

export default async function NuevaBateriaPage({
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

  const action = crearBateria.bind(null, pacienteId)

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
            <a href={`/dashboard/pacientes/${pacienteId}/baterias`}>Baterías</a>
          </li>
          <li className={styles.breadcrumbItem} aria-hidden="true">
            <span className={styles.breadcrumbSep}>›</span>
          </li>
          <li className={styles.breadcrumbItem} aria-current="page">
            Nueva
          </li>
        </ol>
      </nav>

      <h1 className={styles.pageTitle}>Nueva Batería de Evaluación</h1>

      {error && (
        <p role="alert" className={styles.alert}>
          {decodeURIComponent(error)}
        </p>
      )}

      <form action={action} className={styles.form}>
        <fieldset className={styles.fieldset}>
          <legend>Tipo de batería</legend>

          <div className={styles.fieldGroup}>
            {TIPO_OPTIONS.map((opt) => (
              <label key={opt.value} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="tipo"
                  value={opt.value}
                  required
                  className={styles.radioInput}
                />
                {opt.label}
              </label>
            ))}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.labelFor} htmlFor="motivo_consulta">
              Motivo de consulta
            </label>
            <textarea
              id="motivo_consulta"
              name="motivo_consulta"
              rows={3}
              className={styles.textarea}
              placeholder="Descripción breve del motivo de la evaluación (opcional)"
            />
          </div>
        </fieldset>

        <section>
          <h2 className={styles.sectionHeading}>Instrumentos incluidos por tipo</h2>
          {(['tdah_nino', 'tdah_adulto', 'tea'] as const).map((tipo) => (
            <div key={tipo} className={styles.previewBlock}>
              <h3 className={styles.previewTitle}>
                {TIPO_OPTIONS.find(o => o.value === tipo)?.label}
              </h3>
              <ul className={styles.previewList}>
                {BATERIAS_PREDEFINIDAS[tipo].map(({ codigo, informantes }) => (
                  <li key={codigo} className={styles.previewItem}>
                    <span className={styles.previewCodigo}>{getNombreCorto(codigo)}</span>
                    {' — '}
                    {informantes.map(i => INFORMANTE_LABELS[i] ?? i).join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className={styles.previewNote}>
            La batería personalizada se crea sin instrumentos predefinidos.
          </p>
        </section>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary}>Crear batería</button>
          <a href={`/dashboard/pacientes/${pacienteId}/baterias`} className={styles.btnGhost}>Cancelar</a>
        </div>
      </form>
    </div>
  )
}
