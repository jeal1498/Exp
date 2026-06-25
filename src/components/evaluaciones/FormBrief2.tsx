import styles from '@/app/dashboard/pacientes/pacientes.module.css'
import type { Json } from '@/types/database.types'

interface DetalleBrief2 {
  id: string
  informante: string
  nombre_informante: string | null
  fecha_aplicacion: string | null
  duracion_minutos: number | null
  puntajes_brutos: Json | null
  observaciones_conductuales: string | null
}

interface Props {
  detalle: DetalleBrief2
  isLocked: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
}

const NECESITA_NOMBRE = ['padre', 'madre', 'maestro']

const ESCALAS_CLINICAS = [
  { name: 'inhibicion',               label: 'Inhibición' },
  { name: 'supervision_conducta',     label: 'Supervisión de Conducta' },
  { name: 'flexibilidad',             label: 'Flexibilidad' },
  { name: 'control_emocional',        label: 'Control Emocional' },
  { name: 'cambio',                   label: 'Cambio' },
  { name: 'iniciativa',               label: 'Iniciativa' },
  { name: 'memoria_trabajo',          label: 'Memoria de Trabajo' },
  { name: 'planificacion_organizacion', label: 'Planificación / Organización' },
  { name: 'organizacion_materiales',  label: 'Organización de Materiales' },
  { name: 'monitoreo',                label: 'Monitoreo' },
]

const INDICES = [
  { name: 'BRI', label: 'BRI (Índice de Regulación Conductual)' },
  { name: 'ERI', label: 'ERI (Índice de Regulación Emocional)' },
  { name: 'CRI', label: 'CRI (Índice de Regulación Cognitiva)' },
  { name: 'GEC', label: 'GEC (Composición Ejecutiva Global)' },
]

const ESCALAS_VALIDEZ = [
  { name: 'inconsistencia', label: 'Inconsistencia' },
  { name: 'negatividad',    label: 'Negatividad' },
  { name: 'magnitud',       label: 'Magnitud' },
]

function getPuntaje(puntajes: Json | null, key: string): string {
  if (!puntajes || typeof puntajes !== 'object' || Array.isArray(puntajes)) return ''
  const val = (puntajes as Record<string, Json>)[key]
  return val !== null && val !== undefined ? String(val) : ''
}

const INFORMANTE_LABELS: Record<string, string> = {
  padre: 'Padre', madre: 'Madre', maestro: 'Maestro', autoinforme: 'Autoinforme',
}

export function FormBrief2({ detalle, isLocked, action }: Props) {
  return (
    <form action={action} className={styles.form}>
      <fieldset className={styles.fieldset}>
        <legend>BRIEF-2 — {INFORMANTE_LABELS[detalle.informante] ?? detalle.informante}</legend>

        {NECESITA_NOMBRE.includes(detalle.informante) && (
          <div className={styles.fieldGroup}>
            <label className={styles.labelFor} htmlFor="nombre_informante">
              Nombre del informante <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="nombre_informante"
              name="nombre_informante"
              defaultValue={detalle.nombre_informante ?? ''}
              required
              disabled={isLocked}
              className={styles.input}
            />
          </div>
        )}

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
        <legend>Escalas clínicas (puntaje T, rango 20–100)</legend>
        {ESCALAS_CLINICAS.map(({ name, label }) => (
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
        <legend>Índices compuestos (puntaje T, rango 20–100)</legend>
        {INDICES.map(({ name, label }) => (
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
        <legend>Escalas de validez</legend>
        {ESCALAS_VALIDEZ.map(({ name, label }) => (
          <div key={name} className={styles.fieldGroup}>
            <label className={styles.labelFor} htmlFor={name}>{label}</label>
            <input
              type="number"
              id={name}
              name={name}
              defaultValue={getPuntaje(detalle.puntajes_brutos, name)}
              step="any"
              disabled={isLocked}
              className={styles.input}
            />
          </div>
        ))}
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Observaciones conductuales</legend>
        <div className={styles.fieldGroup}>
          <textarea
            id="observaciones_conductuales"
            name="observaciones_conductuales"
            rows={4}
            defaultValue={detalle.observaciones_conductuales ?? ''}
            disabled={isLocked}
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
