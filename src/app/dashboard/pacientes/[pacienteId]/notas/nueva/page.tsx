import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { crearNota } from './actions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nueva Nota de Evolución — Expedientes Clínicos' }

const CIE11_CODES = [
  { codigo: '6D70', descripcion: 'Demencia debida a enfermedad de Alzheimer' },
  { codigo: '6D71', descripcion: 'Demencia vascular' },
  { codigo: '6D72', descripcion: 'Demencia debida a enfermedad de cuerpos de Lewy' },
  { codigo: '6D80', descripcion: 'Deterioro cognitivo leve' },
  { codigo: '6A00', descripcion: 'Trastorno por déficit de atención con hiperactividad (TDAH)' },
  { codigo: '6A02', descripcion: 'Trastorno del espectro autista' },
  { codigo: '6A20', descripcion: 'Esquizofrenia' },
  { codigo: '6A70', descripcion: 'Trastorno depresivo recurrente' },
  { codigo: '6B00', descripcion: 'Trastorno de ansiedad generalizada' },
  { codigo: '6B43', descripcion: 'Trastorno de estrés postraumático (TEPT)' },
  { codigo: '6C40', descripcion: 'Trastorno por consumo de alcohol' },
  { codigo: '6D10', descripcion: 'Amnesia disociativa' },
  { codigo: 'MB21', descripcion: 'Traumatismo craneoencefálico' },
  { codigo: '8A00', descripcion: 'Epilepsia' },
  { codigo: '8A20', descripcion: 'Migraña' },
]

export default async function NuevaNotaPage({
  params,
  searchParams,
}: {
  params: Promise<{ pacienteId: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { pacienteId } = await params
  const sp = await searchParams

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('id, nombre, apellido_paterno')
    .eq('id', pacienteId)
    .eq('is_active', true)
    .single()

  const nombrePaciente = paciente
    ? `${paciente.nombre} ${paciente.apellido_paterno}`
    : 'Paciente'

  const crearNotaBound = crearNota.bind(null, pacienteId)

  const defaultFecha = new Date().toISOString().slice(0, 16)

  return (
    <div>
      <p style={{ fontSize: '0.85em', color: '#555' }}>
        <a href="/dashboard/pacientes">Pacientes</a>
        {' › '}
        <a href={`/dashboard/pacientes/${pacienteId}`}>{nombrePaciente}</a>
        {' › '}
        <a href={`/dashboard/pacientes/${pacienteId}/notas`}>Notas de Evolución</a>
        {' › Nueva Nota'}
      </p>

      <h1>Nueva Nota de Evolución</h1>
      <p style={{ fontSize: '0.85em', color: '#555' }}>
        Campos marcados con <abbr title="obligatorio">*</abbr> son requeridos.
        Al menos un campo SOAP debe completarse.
      </p>

      {sp.error && (
        <p role="alert" style={{ color: 'red', border: '1px solid red', padding: '8px' }}>
          {decodeURIComponent(sp.error)}
        </p>
      )}

      <form action={crearNotaBound}>
        <fieldset>
          <legend>Fecha y diagnóstico</legend>

          <div>
            <label>
              Fecha y hora de la nota * <span style={{ fontSize: '0.8em' }}>(hora en zona local de México)</span>
              <br />
              <input
                type="datetime-local"
                name="fecha_nota"
                required
                defaultValue={defaultFecha}
              />
            </label>
          </div>

          <div style={{ marginTop: '12px' }}>
            <label>
              Código CIE-11
              <br />
              <input
                type="text"
                name="codigo_cie11"
                list="cie11-codigos"
                placeholder="Ej. 6D80"
                style={{ fontFamily: 'monospace', width: '120px' }}
              />
              <datalist id="cie11-codigos">
                {CIE11_CODES.map((c) => (
                  <option key={c.codigo} value={c.codigo} />
                ))}
              </datalist>
            </label>
          </div>

          <div style={{ marginTop: '12px' }}>
            <label>
              Descripción diagnóstica (CIE-11)
              <br />
              <input
                type="text"
                name="descripcion_cie11"
                list="cie11-descripciones"
                placeholder="Descripción del diagnóstico"
                style={{ width: '400px' }}
              />
              <datalist id="cie11-descripciones">
                {CIE11_CODES.map((c) => (
                  <option key={c.codigo} value={c.descripcion} />
                ))}
              </datalist>
            </label>
          </div>
        </fieldset>

        <fieldset style={{ marginTop: '16px' }}>
          <legend>Nota SOAP (NOM-004 §8) — complete al menos un campo</legend>

          <div>
            <label>
              S — Subjetivo <span style={{ fontSize: '0.8em' }}>(motivo de consulta, síntomas referidos por el paciente)</span>
              <br />
              <textarea name="subjetivo" rows={4} cols={70} maxLength={2000} />
            </label>
          </div>

          <div style={{ marginTop: '12px' }}>
            <label>
              O — Objetivo <span style={{ fontSize: '0.8em' }}>(hallazgos observables, resultados de pruebas, signos)</span>
              <br />
              <textarea name="objetivo" rows={4} cols={70} maxLength={2000} />
            </label>
          </div>

          <div style={{ marginTop: '12px' }}>
            <label>
              A — Análisis <span style={{ fontSize: '0.8em' }}>(interpretación clínica, diagnóstico, razonamiento)</span>
              <br />
              <textarea name="analisis" rows={4} cols={70} maxLength={2000} />
            </label>
          </div>

          <div style={{ marginTop: '12px' }}>
            <label>
              P — Plan <span style={{ fontSize: '0.8em' }}>(intervenciones, seguimiento, indicaciones)</span>
              <br />
              <textarea name="plan" rows={4} cols={70} maxLength={2000} />
            </label>
          </div>
        </fieldset>

        <div style={{ marginTop: '16px' }}>
          <button type="submit">Guardar nota</button>
          <span> · </span>
          <a href={`/dashboard/pacientes/${pacienteId}/notas`}>Cancelar</a>
        </div>
      </form>
    </div>
  )
}
