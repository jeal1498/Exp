import styles from '@/app/dashboard/pacientes/pacientes.module.css'
import type { Json } from '@/types/database.types'

interface DetalleWiscV {
  id: string
  informante: string
  fecha_aplicacion: string | null
  duracion_minutos: number | null
  puntajes_brutos: Json | null
  observaciones_conductuales: string | null
}

interface Props {
  detalle: DetalleWiscV
  isLocked: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
}

const SUBPRUEBAS = [
  { name: 'semejanzas',               label: 'Semejanzas' },
  { name: 'vocabulario',              label: 'Vocabulario' },
  { name: 'diseno_cubos',             label: 'Diseño con Cubos' },
  { name: 'matrices',                 label: 'Matrices' },
  { name: 'conceptos_figuras',        label: 'Conceptos con Figuras' },
  { name: 'balanzas',                 label: 'Balanzas' },
  { name: 'retencion_digitos',        label: 'Retención de Dígitos' },
  { name: 'secuencia_letras_numeros', label: 'Secuencia de Letras y Números' },
  { name: 'busqueda_simbolos',        label: 'Búsqueda de Símbolos' },
  { name: 'claves',                   label: 'Claves' },
]

const INDICES = [
  { name: 'VCI',  label: 'VCI (Comprensión Verbal)' },
  { name: 'VSI',  label: 'VSI (Visuoespacial)' },
  { name: 'FRI',  label: 'FRI (Razonamiento Fluido)' },
  { name: 'WMI',  label: 'WMI (Memoria de Trabajo)' },
  { name: 'PSI',  label: 'PSI (Velocidad de Procesamiento)' },
  { name: 'FSIQ', label: 'FSIQ (Cociente de Inteligencia Plena)' },
]

function getPuntaje(puntajes: Json | null, key: string): string {
  if (!puntajes || typeof puntajes !== 'object' || Array.isArray(puntajes)) return ''
  const val = (puntajes as Record<string, Json>)[key]
  return val !== null && val !== undefined ? String(val) : ''
}

export function FormWiscV({ detalle, isLocked, action }: Props) {
  return (
    <form action={action} className={styles.form}>
      <fieldset className={styles.fieldset}>
        <legend>WISC-V — Rendimiento directo (Karen)</legend>

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
        <legend>Subpruebas principales (puntaje escalar, rango 1–19)</legend>
        {SUBPRUEBAS.map(({ name, label }) => (
          <div key={name} className={styles.fieldGroup}>
            <label className={styles.labelFor} htmlFor={name}>{label}</label>
            <input
              type="number"
              id={name}
              name={name}
              defaultValue={getPuntaje(detalle.puntajes_brutos, name)}
              min={1}
              max={19}
              step="1"
              disabled={isLocked}
              className={styles.input}
            />
          </div>
        ))}
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Índices compuestos y FSIQ</legend>
        {INDICES.map(({ name, label }) => (
          <div key={name} className={styles.fieldGroup}>
            <label className={styles.labelFor} htmlFor={name}>{label}</label>
            <input
              type="number"
              id={name}
              name={name}
              defaultValue={getPuntaje(detalle.puntajes_brutos, name)}
              step="1"
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
