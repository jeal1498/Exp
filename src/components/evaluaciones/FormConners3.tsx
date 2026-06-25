import styles from '@/app/dashboard/pacientes/pacientes.module.css'
import type { Json } from '@/types/database.types'

interface DetalleConners3 {
  id: string
  informante: string
  nombre_informante: string | null
  fecha_aplicacion: string | null
  duracion_minutos: number | null
  puntajes_brutos: Json | null
  observaciones_conductuales: string | null
}

interface Props {
  detalle: DetalleConners3
  isLocked: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
}

const NECESITA_NOMBRE = ['padre', 'madre', 'maestro']

const ESCALAS_CLINICAS = [
  { name: 'inatención',                  label: 'Inatención' },
  { name: 'hiperactividad_impulsividad', label: 'Hiperactividad / Impulsividad' },
  { name: 'problemas_aprendizaje',       label: 'Problemas de Aprendizaje' },
  { name: 'funcionamiento_ejecutivo',    label: 'Funcionamiento Ejecutivo' },
  { name: 'agresión',                    label: 'Agresión' },
  { name: 'relaciones_pares',            label: 'Relaciones con Pares' },
  { name: 'indice_tdah',                 label: 'Índice de TDAH' },
  { name: 'dsm5_inatento',              label: 'DSM-5 Inatento' },
  { name: 'dsm5_hiperactivo',           label: 'DSM-5 Hiperactivo-Impulsivo' },
]

const ESCALAS_VALIDEZ = [
  { name: 'indice_inconsistencia',     label: 'Índice de Inconsistencia' },
  { name: 'indice_impresion_positiva', label: 'Índice de Impresión Positiva' },
  { name: 'indice_impresion_negativa', label: 'Índice de Impresión Negativa' },
]

function getPuntaje(puntajes: Json | null, key: string): string {
  if (!puntajes || typeof puntajes !== 'object' || Array.isArray(puntajes)) return ''
  const val = (puntajes as Record<string, Json>)[key]
  return val !== null && val !== undefined ? String(val) : ''
}

export function FormConners3({ detalle, isLocked, action }: Props) {
  const INFORMANTE_LABELS: Record<string, string> = {
    padre: 'Padre', madre: 'Madre', maestro: 'Maestro', autoinforme: 'Autoinforme',
  }

  return (
    <form action={action} className={styles.form}>
      <fieldset className={styles.fieldset}>
        <legend>CONNERS-3 — {INFORMANTE_LABELS[detalle.informante] ?? detalle.informante}</legend>

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
        <legend>Escalas de validez (puntaje T, rango 20–100)</legend>
        {ESCALAS_VALIDEZ.map(({ name, label }) => (
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
