import styles from '@/app/dashboard/pacientes/pacientes.module.css'
import type { Json } from '@/types/database.types'

interface DetalleCpt3 {
  id: string
  informante: string
  fecha_aplicacion: string | null
  duracion_minutos: number | null
  puntajes_brutos: Json | null
  observaciones_conductuales: string | null
}

interface Props {
  detalle: DetalleCpt3
  isLocked: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
}

const OUTPUTS = [
  { name: 'omisiones',    label: 'Omisiones (puntaje T)' },
  { name: 'comisiones',   label: 'Comisiones (puntaje T)' },
  { name: 'hit_rt',       label: 'Hit RT — Tiempo de reacción (puntaje T)' },
  { name: 'hit_rt_se',    label: 'Hit RT SE — Consistencia del TR (puntaje T)' },
  { name: 'variabilidad', label: 'Variabilidad entre bloques (puntaje T)' },
  { name: 'd_prima',      label: "d' (Detectabilidad, puntaje T)" },
  { name: 'beta',         label: 'β (Criterio de respuesta, puntaje T)' },
]

function getPuntaje(puntajes: Json | null, key: string): string {
  if (!puntajes || typeof puntajes !== 'object' || Array.isArray(puntajes)) return ''
  const val = (puntajes as Record<string, Json>)[key]
  return val !== null && val !== undefined ? String(val) : ''
}

export function FormCpt3({ detalle, isLocked, action }: Props) {
  return (
    <form action={action} className={styles.form}>
      <fieldset className={styles.fieldset}>
        <legend>CPT-3 — Rendimiento computarizado (Karen)</legend>

        <div className={styles.fieldGroup}>
          <label className={styles.labelFor} htmlFor="fecha_aplicacion">Fecha de aplicación</label>
          <input
            type="date"
            id="fecha_aplicacion"
            name="fecha_aplicacion"
            defaultValue={detalle.fecha_aplicacion ?? ''}
            disabled={isLocked}
            className={styles.input}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.labelFor} htmlFor="duracion_minutos">Duración (minutos)</label>
          <input
            type="number"
            id="duracion_minutos"
            name="duracion_minutos"
            defaultValue={detalle.duracion_minutos ?? ''}
            min={1}
            disabled={isLocked}
            className={styles.input}
          />
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Índices de output (puntaje T, rango 20–100)</legend>
        {OUTPUTS.map(({ name, label }) => (
          <div key={name} className={styles.fieldGroup}>
            <label className={styles.labelFor} htmlFor={name}>{label}</label>
            <input
              type="number"
              id={name}
              name={name}
              defaultValue={getPuntaje(detalle.puntajes_brutos, name)}
              min={20}
              max={100}
              step="any"
              disabled={isLocked}
              className={styles.input}
            />
          </div>
        ))}
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Nota clínica (del PDF de reporte del CPT-3)</legend>
        <div className={styles.fieldGroup}>
          <textarea
            id="observaciones_conductuales"
            name="observaciones_conductuales"
            rows={5}
            defaultValue={detalle.observaciones_conductuales ?? ''}
            disabled={isLocked}
            placeholder="Pegar aquí observaciones clave del reporte PDF del CPT-3 (opcional)"
            className={styles.textarea}
          />
        </div>
      </fieldset>

      {!isLocked && (
        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary}>Guardar puntajes</button>
        </div>
      )}
    </form>
  )
}
