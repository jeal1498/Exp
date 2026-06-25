import styles from '@/app/dashboard/pacientes/pacientes.module.css'
import type { Json } from '@/types/database.types'

interface DetalleAdos2 {
  id: string
  informante: string
  fecha_aplicacion: string | null
  duracion_minutos: number | null
  puntajes_brutos: Json | null
  observaciones_conductuales: string | null
}

interface Props {
  detalle: DetalleAdos2
  isLocked: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
}

function getPuntaje(puntajes: Json | null, key: string): string {
  if (!puntajes || typeof puntajes !== 'object' || Array.isArray(puntajes)) return ''
  const val = (puntajes as Record<string, Json>)[key]
  return val !== null && val !== undefined ? String(val) : ''
}

export function FormAdos2({ detalle, isLocked, action }: Props) {
  const moduloActual = getPuntaje(detalle.puntajes_brutos, 'modulo')
  const moduloNum = parseInt(moduloActual) || 1

  return (
    <form action={action} className={styles.form}>
      <fieldset className={styles.fieldset}>
        <legend>ADOS-2 — Observación directa (Karen)</legend>

        <div className={styles.fieldGroup}>
          <label className={styles.labelFor} htmlFor="modulo">
            Módulo <span className={styles.required}>*</span>
          </label>
          <select
            id="modulo"
            name="modulo"
            required
            defaultValue={moduloActual || ''}
            disabled={isLocked}
            className={styles.select}
          >
            <option value="" disabled>— Seleccionar —</option>
            <option value="1">Módulo 1 (sin lenguaje o lenguaje limitado)</option>
            <option value="2">Módulo 2 (lenguaje de frases)</option>
            <option value="3">Módulo 3 (lenguaje fluido, niños/adolescentes)</option>
            <option value="4">Módulo 4 (lenguaje fluido, adultos)</option>
          </select>
        </div>

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
        <legend>Puntajes del algoritmo</legend>

        <div className={styles.fieldGroup}>
          <label className={styles.labelFor} htmlFor="social_affect_total">
            SA Total (Social Affect)
          </label>
          <input
            type="number"
            id="social_affect_total"
            name="social_affect_total"
            defaultValue={getPuntaje(detalle.puntajes_brutos, 'social_affect_total')}
            min={0}
            step="1"
            disabled={isLocked}
            className={styles.input}
          />
        </div>

        {moduloNum < 4 && (
          <div className={styles.fieldGroup}>
            <label className={styles.labelFor} htmlFor="rrb_total">
              RRB Total (Conducta Repetitiva Restringida)
            </label>
            <input
              type="number"
              id="rrb_total"
              name="rrb_total"
              defaultValue={getPuntaje(detalle.puntajes_brutos, 'rrb_total')}
              min={0}
              step="1"
              disabled={isLocked}
              className={styles.input}
            />
          </div>
        )}

        <div className={styles.fieldGroup}>
          <label className={styles.labelFor} htmlFor="total_algoritmo">
            Total del algoritmo <span className={styles.required}>*</span>
          </label>
          <input
            type="number"
            id="total_algoritmo"
            name="total_algoritmo"
            required
            defaultValue={getPuntaje(detalle.puntajes_brutos, 'total_algoritmo')}
            min={0}
            step="1"
            disabled={isLocked}
            className={styles.input}
          />
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Puntuaciones de Comparación Social (CSS, rango 1–10)</legend>

        <div className={styles.fieldGroup}>
          <label className={styles.labelFor} htmlFor="css_total">CSS Total</label>
          <input
            type="number"
            id="css_total"
            name="css_total"
            defaultValue={getPuntaje(detalle.puntajes_brutos, 'css_total')}
            min={1}
            max={10}
            step="1"
            disabled={isLocked}
            className={styles.input}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.labelFor} htmlFor="css_social_affect">CSS SA (Social Affect)</label>
          <input
            type="number"
            id="css_social_affect"
            name="css_social_affect"
            defaultValue={getPuntaje(detalle.puntajes_brutos, 'css_social_affect')}
            min={1}
            max={10}
            step="1"
            disabled={isLocked}
            className={styles.input}
          />
        </div>

        {moduloNum < 4 && (
          <div className={styles.fieldGroup}>
            <label className={styles.labelFor} htmlFor="css_rrb">CSS RRB</label>
            <input
              type="number"
              id="css_rrb"
              name="css_rrb"
              defaultValue={getPuntaje(detalle.puntajes_brutos, 'css_rrb')}
              min={1}
              max={10}
              step="1"
              disabled={isLocked}
              className={styles.input}
            />
          </div>
        )}
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Observaciones conductuales</legend>
        <div className={styles.fieldGroup}>
          <textarea
            id="observaciones_conductuales"
            name="observaciones_conductuales"
            rows={5}
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
