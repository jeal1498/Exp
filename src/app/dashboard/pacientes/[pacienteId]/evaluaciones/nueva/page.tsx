import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { crearEvaluacion } from './actions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nueva Evaluación — Expedientes Clínicos' }

const DOMINIOS = [
  'Memoria',
  'Atencion',
  'Funciones Ejecutivas',
  'Lenguaje',
  'Visuoespacial',
  'Velocidad de Procesamiento',
  'Habilidades Academicas',
  'Conducta y Emocion',
] as const

const PRUEBAS_COMUNES = [
  'WAIS-IV', 'WISC-V', 'TMT-A', 'TMT-B', 'Stroop', 'FAS',
  'BNT', 'RAVLT', 'RBMT', 'SDMT', 'Figura de Rey', 'MMSE', 'MoCA',
]

export default async function NuevaEvaluacionPage({
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

  const action = crearEvaluacion.bind(null, pacienteId)

  return (
    <div>
      <p style={{ fontSize: '0.85em', color: '#555' }}>
        <a href="/dashboard/pacientes">Pacientes</a>
        {' › '}
        <a href={`/dashboard/pacientes/${pacienteId}`}>
          {paciente ? `${paciente.nombre} ${paciente.apellido_paterno}` : 'Paciente'}
        </a>
        {' › '}
        <a href={`/dashboard/pacientes/${pacienteId}/evaluaciones`}>Evaluaciones</a>
        {' › Nueva'}
      </p>

      <h1>Nueva Evaluación Neuropsicológica</h1>

      {error && (
        <p role="alert" style={{ color: 'red', border: '1px solid red', padding: '8px' }}>
          {decodeURIComponent(error)}
        </p>
      )}

      <form action={action} style={{ maxWidth: '500px', lineHeight: '2' }}>
        <div>
          <label htmlFor="fecha_evaluacion"><strong>Fecha de evaluación *</strong></label><br />
          <input
            type="date"
            id="fecha_evaluacion"
            name="fecha_evaluacion"
            required
            style={{ width: '100%', padding: '4px' }}
          />
        </div>

        <div style={{ marginTop: '12px' }}>
          <label htmlFor="nombre_prueba"><strong>Nombre de la prueba *</strong></label><br />
          <input
            type="text"
            id="nombre_prueba"
            name="nombre_prueba"
            list="pruebas-list"
            required
            placeholder="Ej. WAIS-IV, TMT-A…"
            style={{ width: '100%', padding: '4px' }}
          />
          <datalist id="pruebas-list">
            {PRUEBAS_COMUNES.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>

        <div style={{ marginTop: '12px' }}>
          <label htmlFor="dominio"><strong>Dominio cognitivo *</strong></label><br />
          <select
            id="dominio"
            name="dominio"
            required
            style={{ width: '100%', padding: '4px' }}
          >
            <option value="">— Seleccionar —</option>
            {DOMINIOS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: '12px' }}>
          <label htmlFor="puntaje_bruto"><strong>Puntaje bruto</strong></label><br />
          <input
            type="number"
            id="puntaje_bruto"
            name="puntaje_bruto"
            step="any"
            style={{ width: '100%', padding: '4px' }}
          />
        </div>

        <div style={{ marginTop: '12px' }}>
          <label htmlFor="percentil"><strong>Percentil</strong> (0 – 100)</label><br />
          <input
            type="number"
            id="percentil"
            name="percentil"
            min={0}
            max={100}
            step="any"
            style={{ width: '100%', padding: '4px' }}
          />
        </div>

        <div style={{ marginTop: '12px' }}>
          <label htmlFor="puntuacion_estandar"><strong>Puntuación estándar</strong></label><br />
          <input
            type="number"
            id="puntuacion_estandar"
            name="puntuacion_estandar"
            step="any"
            style={{ width: '100%', padding: '4px' }}
          />
        </div>

        <div style={{ marginTop: '12px' }}>
          <label htmlFor="observaciones"><strong>Observaciones</strong></label><br />
          <textarea
            id="observaciones"
            name="observaciones"
            rows={4}
            style={{ width: '100%', padding: '4px' }}
          />
        </div>

        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <button type="submit" style={{ padding: '8px 16px' }}>
            Guardar evaluación
          </button>
          <a href={`/dashboard/pacientes/${pacienteId}/evaluaciones`}>Cancelar</a>
        </div>
      </form>
    </div>
  )
}
