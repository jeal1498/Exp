import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { crearBateria } from './actions'
import {
  TIPOS_BATERIA,
  TIPO_BATERIA_LABEL,
  BATERIAS_PREDEFINIDAS,
  INSTRUMENTOS_KAREN,
  INFORMANTE_LABEL,
} from '@/lib/evaluaciones/constants'
import type { TipoBateria } from '@/lib/evaluaciones/constants'
import styles from '../../../pacientes.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nueva Batería — Expedientes Clínicos' }

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
          <li className={styles.breadcrumbItem} aria-current="page">Nueva</li>
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
            <p className={styles.labelFor}>
              Seleccione el tipo <span className={styles.required}>*</span>
            </p>
            {TIPOS_BATERIA.map((tipo) => {
              const preset = tipo !== 'personalizada'
                ? BATERIAS_PREDEFINIDAS[tipo as Exclude<TipoBateria, 'personalizada'>]
                : null

              return (
                <div key={tipo} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="tipo"
                      value={tipo}
                      required
                      style={{ marginTop: '3px', flexShrink: 0 }}
                    />
                    <span>
                      <strong>{TIPO_BATERIA_LABEL[tipo]}</strong>
                      {preset && (
                        <span style={{ display: 'block', fontSize: '0.85em', color: 'oklch(0.500 0.000 0)', marginTop: '0.2rem' }}>
                          Incluye:{' '}
                          {preset.map(({ codigo, informantes }) => {
                            const inst = INSTRUMENTOS_KAREN.find(i => i.codigo === codigo)
                            return inst
                              ? `${inst.nombre_corto} (${informantes.map(i => INFORMANTE_LABEL[i]).join(', ')})`
                              : codigo
                          }).join(' · ')}
                        </span>
                      )}
                      {!preset && (
                        <span style={{ display: 'block', fontSize: '0.85em', color: 'oklch(0.500 0.000 0)', marginTop: '0.2rem' }}>
                          Agregue instrumentos manualmente después de crear la batería.
                        </span>
                      )}
                    </span>
                  </label>
                </div>
              )
            })}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.labelFor} htmlFor="motivo_consulta">
              Motivo de consulta <span className={styles.labelHint}>(opcional)</span>
            </label>
            <textarea
              id="motivo_consulta"
              name="motivo_consulta"
              rows={3}
              className={styles.textarea}
              placeholder="Ej. Valoración por sospecha de TDAH referida por pediatra…"
            />
          </div>
        </fieldset>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary}>Crear batería</button>
          <a href={`/dashboard/pacientes/${pacienteId}/baterias`} className={styles.btnGhost}>Cancelar</a>
        </div>
      </form>
    </div>
  )
}
