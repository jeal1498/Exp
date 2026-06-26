import { View, Text } from '@react-pdf/renderer'
import { pdfStyles } from '../pdfStyles'
import type { Database } from '@/types/database.types'

type EvaluacionNeuro = Database['public']['Tables']['evaluaciones_neuro']['Row']

function formatFecha(fecha: string): string {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

interface EvaluacionesNeuroProps {
  evaluaciones: EvaluacionNeuro[]
}

export function EvaluacionesNeuro({ evaluaciones }: EvaluacionesNeuroProps) {
  if (evaluaciones.length === 0) {
    return (
      <View>
        <Text style={pdfStyles.sectionTitle}>§3 Evaluaciones Neuropsicológicas</Text>
        <Text style={[pdfStyles.value, { color: '#888' }]}>Sin evaluaciones registradas.</Text>
      </View>
    )
  }

  // Agrupar por dominio cognitivo
  const byDominio = evaluaciones.reduce<Record<string, EvaluacionNeuro[]>>((acc, ev) => {
    const dom = ev.dominio || 'Sin clasificar'
    if (!acc[dom]) acc[dom] = []
    acc[dom].push(ev)
    return acc
  }, {})

  return (
    <View>
      <Text style={pdfStyles.sectionTitle}>§3 Evaluaciones Neuropsicológicas</Text>

      {Object.entries(byDominio).map(([dominio, evs]) => (
        <View key={dominio} style={{ marginBottom: 12 }}>
          <Text style={[pdfStyles.label, { marginBottom: 4, fontSize: 10, color: '#382f51' }]}>
            {dominio}
          </Text>

          {evs.map((ev) => (
            <View
              key={ev.id}
              style={{
                marginBottom: 6,
                paddingLeft: 8,
                borderLeftWidth: 2,
                borderLeftColor: ev.is_locked ? '#382f51' : '#ccc',
              }}
            >
              <View style={pdfStyles.row}>
                <Text style={[pdfStyles.label, { flex: 1 }]}>{ev.nombre_prueba}</Text>
                {ev.is_locked && (
                  <Text style={{ fontSize: 8, color: '#382f51' }}>BLOQUEADO</Text>
                )}
              </View>

              <View style={[pdfStyles.row, { marginTop: 2 }]}>
                <Text style={[pdfStyles.label, { width: 120, fontSize: 9 }]}>Fecha:</Text>
                <Text style={pdfStyles.value}>{formatFecha(ev.fecha_evaluacion)}</Text>
              </View>

              {ev.puntaje_bruto !== null && (
                <View style={pdfStyles.row}>
                  <Text style={[pdfStyles.label, { width: 120, fontSize: 9 }]}>Puntaje bruto:</Text>
                  <Text style={pdfStyles.value}>{ev.puntaje_bruto}</Text>
                </View>
              )}
              {ev.percentil !== null && (
                <View style={pdfStyles.row}>
                  <Text style={[pdfStyles.label, { width: 120, fontSize: 9 }]}>Percentil:</Text>
                  <Text style={pdfStyles.value}>{ev.percentil}</Text>
                </View>
              )}
              {ev.puntuacion_estandar !== null && (
                <View style={pdfStyles.row}>
                  <Text style={[pdfStyles.label, { width: 120, fontSize: 9 }]}>Puntuación estándar:</Text>
                  <Text style={pdfStyles.value}>{ev.puntuacion_estandar}</Text>
                </View>
              )}
              {ev.observaciones && (
                <View style={pdfStyles.row}>
                  <Text style={[pdfStyles.label, { width: 120, fontSize: 9 }]}>Observaciones:</Text>
                  <Text style={[pdfStyles.value, { flex: 1 }]}>{ev.observaciones}</Text>
                </View>
              )}

              {ev.is_locked && ev.hash_integridad && (
                <View style={{ marginTop: 2 }}>
                  <Text style={{ fontSize: 7, color: '#888' }}>
                    SHA-256: {ev.hash_integridad}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}
