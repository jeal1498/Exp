import { crearPaciente } from './actions'
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

export default async function NuevoPacientePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div>
      <h1>Registrar Nuevo Paciente</h1>
      <p style={{ fontSize: '0.85em', color: '#555' }}>
        Campos marcados con <abbr title="obligatorio">*</abbr> son requeridos por NOM-004-SSA3-2012.
      </p>

      {params.error && (
        <p role="alert" style={{ color: 'red', border: '1px solid red', padding: '8px' }}>
          {decodeURIComponent(params.error)}
        </p>
      )}

      <form action={crearPaciente}>
        <fieldset>
          <legend>Datos de identificación</legend>

          <div>
            <label>
              Nombre(s) *
              <br />
              <input type="text" name="nombre" required maxLength={100} />
            </label>
          </div>

          <div>
            <label>
              Apellido paterno *
              <br />
              <input type="text" name="apellido_paterno" required maxLength={100} />
            </label>
          </div>

          <div>
            <label>
              Apellido materno
              <br />
              <input type="text" name="apellido_materno" maxLength={100} />
            </label>
          </div>

          <div>
            <label>
              Fecha de nacimiento *
              <br />
              <input type="date" name="fecha_nacimiento" required />
            </label>
          </div>

          <div>
            <label>
              Sexo * <span style={{ fontSize: '0.8em' }}>(según CURP)</span>
              <br />
              <select name="sexo" required defaultValue="">
                <option value="" disabled>Seleccionar…</option>
                <option value="Masculino">Masculino (H)</option>
                <option value="Femenino">Femenino (M)</option>
              </select>
            </label>
          </div>

          <div>
            <label>
              CURP * <span style={{ fontSize: '0.8em' }}>(18 caracteres — se valida dígito verificador)</span>
              <br />
              <input
                type="text"
                name="curp"
                required
                minLength={18}
                maxLength={18}
                pattern="[A-Za-z0-9]{18}"
                style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                placeholder="XXXX000000XXXXXXXX0"
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Datos neuropsicológicos (NOM-004)</legend>

          <div>
            <label>
              Lateralidad *
              <br />
              <select name="lateralidad" required defaultValue="">
                <option value="" disabled>Seleccionar…</option>
                <option value="Diestro">Diestro</option>
                <option value="Zurdo">Zurdo</option>
                <option value="Ambidiestro">Ambidiestro</option>
              </select>
            </label>
          </div>

          <div>
            <label>
              Escolaridad *
              <br />
              <select name="escolaridad" required defaultValue="">
                <option value="" disabled>Seleccionar…</option>
                {ESCOLARIDADES.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Datos de contacto</legend>

          <div>
            <label>
              Ocupación
              <br />
              <input type="text" name="ocupacion" maxLength={100} />
            </label>
          </div>

          <div>
            <label>
              Domicilio
              <br />
              <input type="text" name="domicilio" maxLength={255} />
            </label>
          </div>

          <div>
            <label>
              Teléfono
              <br />
              <input type="tel" name="telefono" maxLength={20} />
            </label>
          </div>

          <div>
            <label>
              Correo electrónico
              <br />
              <input type="email" name="email" maxLength={150} />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Motivo de consulta</legend>

          <div>
            <label>
              Motivo de consulta
              <br />
              <textarea name="motivo_consulta" rows={4} cols={60} maxLength={1000} />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Consentimiento informado (NOM-004 §7.1)</legend>

          <label>
            <input type="checkbox" name="consentimiento_informado" required />
            {' '}
            El paciente o tutor ha otorgado consentimiento informado por escrito para el
            tratamiento de sus datos clínicos y la realización de evaluaciones
            neuropsicológicas, conforme al Art. 7 de la NOM-004-SSA3-2012. *
          </label>
        </fieldset>

        <div style={{ marginTop: '16px' }}>
          <button type="submit">Registrar paciente</button>
          <span> · </span>
          <a href="/dashboard/pacientes">Cancelar</a>
        </div>
      </form>
    </div>
  )
}
