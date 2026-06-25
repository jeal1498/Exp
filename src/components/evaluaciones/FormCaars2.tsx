import styles from '@/app/dashboard/pacientes/pacientes.module.css'
import type { Json } from '@/types/database.types'

interface DetalleCaars2 {
  id: string
  informante: string
  nombre_informante: string | null
  fecha_aplicacion: string | null
  duracion_minutos: number | null
  puntajes_brutos: Json | null
  observaciones_conductuales: string | null
}

interface Props {
  detalle: DetalleCaars2
  isLocked: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
}

const NECESITA_NOMBRE = ['observador']

const SUBESCALAS = [
  { name: 'inatención_problemas_memoria', label: 'Inatención / Problemas de Memoria (A)' },
  { name: 'hiperactividad_agitacion',     label: 'Hiperactividad / Agitación (B)' },
  { name: 'impulsividad_labilidad',       label: 'Impulsividad / Labilidad Emocional (C)' },
  { name: 'problemas_autoconcepto',       label: 'Problemas de Autoconcepto (D)' },
  { name: 'indice_tdah',                  label: 'Índice de TDAH de Conners (E)' },
]

const INDICES_DSM = [
  { name: 'dsm5_inatento',     label: 'DSM-5 Inatento (F)' },
  { name: 'dsm5_hiperactivo',  label: 'DSM-5 Hiperactivo-Impulsivo (G)' },
]

function getPuntaje(puntajes: Json | null, key: string): string {
  if (!puntajes || typeof puntajes !== 'object' || Array.isArray(puntajes)) return ''
  const val = (puntajes as Record<string, Json>)[key]
  return val !== null && val !== undefined ? String(val) : ''
}

const INFORMANTE_LABELS: Record<string, string> = {
  autoinforme: 'Autoinforme', observador: 'Observador',
}

export function FormCaars2({ detalle, isLocked, action }: Props) {
  return (
    <form action={action} className={styles.form}>
      <fieldset className={styles.fieldset}>
        <legend>CAARS-2 — {INFORMANTE_LABELS[detalle.informante] ?? detalle.informante}</legend>

        {NECESITA_NOMBRE.includes(detalle.informante) && (
          <div className={styles.fieldGroup}>
            <label className={styles.labelFor} htmlFor="nombre_informante">
              Nombre del observador <span className={styles.required}>*</span>
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
        <legend>Subescalas (puntaje T, rango 20–100)</legend>
        {SUBESCALAS.map(({ name, label }) => (
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
        <legend>Escalas DSM-5 (puntaje T, rango 20–100)</legend>
        {INDICES_DSM.map(({ name, label }) => (
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
