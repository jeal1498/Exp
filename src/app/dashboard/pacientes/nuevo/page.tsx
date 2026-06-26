import { crearPaciente } from './actions'
import styles from '../pacientes.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nuevo Paciente — Expedientes Clínicos' }

const ESCOLARIDADES = [
  'Ninguna',
  'Preescolar',
  'Primaria incompleta',
  'Primaria completa',
  'Secundaria incompleta',
  'Secundaria completa',
  'Preparatoria/Bachillerato incompleta',
  'Preparatoria/Bachillerato completa',
  'Técnico/Vocacional',
  'Licenciatura incompleta',
  'Licenciatura completa',
  'Posgrado',
]

const ESTADOS_CIVILES = [
  'Soltero/a',
  'Casado/a',
  'Divorciado/a',
  'Viudo/a',
  'Unión libre',
  'No aplica',
]

export default async function NuevoPacientePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div>
      <h1 className={styles.pageTitle}>Registrar Nuevo Paciente</h1>
      <p className={styles.helperText}>
        Campos marcados con{' '}
        <abbr title="obligatorio">
          <span className={styles.required}>*</span>
        </abbr>{' '}
        son requeridos por NOM-004-SSA3-2012.
      </p>

      {params.error && (
        <p role="alert" className={styles.alert}>
          {decodeURIComponent(params.error)}
        </p>
      )}

      <form action={crearPaciente} className={styles.form}>
        {/* ── Datos de identificación ── */}
        <fieldset className={styles.fieldset}>
          <legend>Datos de identificación</legend>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>
                Nombre(s) <span className={styles.required}>*</span>
              </span>
              <input
                type="text"
                name="nombre"
                required
                maxLength={100}
                className={styles.input}
              />
            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>
                Apellido paterno <span className={styles.required}>*</span>
              </span>
              <input
                type="text"
                name="apellido_paterno"
                required
                maxLength={100}
                className={styles.input}
              />
            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>Apellido materno</span>
              <input
                type="text"
                name="apellido_materno"
                maxLength={100}
                className={styles.input}
              />
            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>
                Fecha de nacimiento <span className={styles.required}>*</span>
              </span>
              <input
                type="date"
                name="fecha_nacimiento"
                required
                className={styles.input}
              />
            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>
                Sexo <span className={styles.required}>*</span>{' '}
                <span className={styles.labelHint}>(según CURP)</span>
              </span>
              <select name="sexo" required defaultValue="" className={styles.select}>
                <option value="" disabled>
                  Seleccionar…
                </option>
                <option value="M">Masculino (H)</option>
                <option value="F">Femenino (M)</option>
              </select>
            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>
                CURP <span className={styles.required}>*</span>{' '}
                <span className={styles.labelHint}>
                  (18 caracteres — se valida dígito verificador)
                </span>
              </span>
              <input
                type="text"
                name="curp"
                required
                minLength={18}
                maxLength={18}
                pattern="[A-Za-z0-9]{18}"
                className={styles.inputMono}
                placeholder="XXXX000000XXXXXXXX0"
              />
            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>Lugar de nacimiento</span>
              <input
                type="text"
                name="lugar_nacimiento"
                maxLength={150}
                className={styles.input}
                placeholder="Ciudad, Estado"
              />
            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>Estado civil</span>
              <select name="estado_civil" defaultValue="" className={styles.select}>
                <option value="">No registrado</option>
                {ESTADOS_CIVILES.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>

        {/* ── Datos neuropsicológicos ── */}
        <fieldset className={styles.fieldset}>
          <legend>Datos neuropsicológicos (NOM-004)</legend>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>
                Lateralidad <span className={styles.required}>*</span>
              </span>
              <select
                name="lateralidad"
                required
                defaultValue=""
                className={styles.select}
              >
                <option value="" disabled>
                  Seleccionar…
                </option>
                <option value="Diestro">Diestro</option>
                <option value="Zurdo">Zurdo</option>
                <option value="Ambidiestro">Ambidiestro</option>
              </select>
            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>
                Escolaridad <span className={styles.required}>*</span>
              </span>
              <select
                name="escolaridad"
                required
                defaultValue=""
                className={styles.select}
              >
                <option value="" disabled>
                  Seleccionar…
                </option>
                {ESCOLARIDADES.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>

        {/* ── Tutor / Responsable legal ── */}
        <fieldset className={styles.fieldset}>
          <legend>Tutor / Responsable legal</legend>

          <p className={styles.helperText}>
            Requerido para pacientes menores de 18 años (NOM-004 art. 5.1).
          </p>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>Nombre completo del tutor</span>
              <input
                type="text"
                name="tutor_nombre"
                maxLength={150}
                className={styles.input}
              />
            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>Relación con el paciente</span>
              <select name="tutor_relacion" defaultValue="" className={styles.select}>
                <option value="">No aplica / No registrado</option>
                <option value="Padre">Padre</option>
                <option value="Madre">Madre</option>
                <option value="Abuelo/a">Abuelo/a</option>
                <option value="Tutor legal">Tutor legal</option>
                <option value="Otro">Otro</option>
              </select>
            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>Teléfono del tutor</span>
              <input
                type="tel"
                name="tutor_telefono"
                maxLength={20}
                className={styles.input}
              />
            </label>
          </div>
        </fieldset>

        {/* ── Datos de contacto ── */}
        <fieldset className={styles.fieldset}>
          <legend>Datos de contacto</legend>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>Ocupación</span>
              <input
                type="text"
                name="ocupacion"
                maxLength={100}
                className={styles.input}
              />
            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>Domicilio</span>
              <input
                type="text"
                name="domicilio"
                maxLength={255}
                className={styles.input}
              />
            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>Teléfono</span>
              <input
                type="tel"
                name="telefono"
                maxLength={20}
                className={styles.input}
              />
            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>Correo electrónico</span>
              <input
                type="email"
                name="email"
                maxLength={150}
                className={styles.input}
              />
            </label>
          </div>
        </fieldset>

        {/* ── Motivo de consulta ── */}
        <fieldset className={styles.fieldset}>
          <legend>Motivo de consulta</legend>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span>Motivo de consulta</span>
              <textarea
                name="motivo_consulta"
                rows={4}
                maxLength={1000}
                className={styles.textarea}
              />
            </label>
          </div>
        </fieldset>

        {/* ── Consentimiento informado ── */}
        <fieldset className={styles.fieldset}>
          <legend>Consentimiento informado (NOM-004 §7.1)</legend>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="consentimiento_informado"
              required
            />
            <span>
              El paciente o tutor ha otorgado consentimiento informado por
              escrito para el tratamiento de sus datos clínicos y la realización
              de evaluaciones neuropsicológicas, conforme al Art. 7 de la
              NOM-004-SSA3-2012.{' '}
              <span className={styles.required}>*</span>
            </span>
          </label>
        </fieldset>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary}>
            Registrar paciente
          </button>
          <a href="/dashboard/pacientes" className={styles.btnGhost}>
            Cancelar
          </a>
        </div>
      </form>
    </div>
  )
}
