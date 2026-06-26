import { View, Text } from '@react-pdf/renderer'
import { pdfStyles } from '../pdfStyles'
import type { Database } from '@/types/database.types'

type NotaEvolucion = Database['public']['Tables']['notas_evolucion']['Row']

function formatFecha(fecha: string): string {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function CampoSOAP({ letra, label, value }: { letra: string; label: string; value: string | null }) {
  if (!value) return null
  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={[pdfStyles.label, { fontSize: 9 }]}>
        {letra} — {label}:
      </Text>
      <Text style={[pdfStyles.value, { paddingLeft: 8, lineHeight: 1.4 }]}>{value}</Text>
    </View>
  )
}

interface NotasEvolucionProps {
  notas: NotaEvolucion[]
}

export function NotasEvolucion({ notas }: NotasEvolucionProps) {
  if (notas.length === 0) {
    return (
      <View>
        <Text style={pdfStyles.sectionTitle}>§4 Notas de Evolución SOAP</Text>
        <Text style={[pdfStyles.value, { color: '#888' }]}>Sin notas de evolución registradas.</Text>
      </View>
    )
  }

  return (
    <View>
      <Text style={pdfStyles.sectionTitle}>§4 Notas de Evolución SOAP</Text>

      {notas.map((nota) => (
        <View
          key={nota.id}
          style={{
            marginBottom: 12,
            paddingBottom: 8,
            borderBottomWidth: 0.5,
            borderBottomColor: '#ddd',
          }}
        >
          <View style={[pdfStyles.row, { marginBottom: 4 }]}>
            <Text style={[pdfStyles.label, { flex: 1 }]}>
              {formatFecha(nota.fecha_nota)}
            </Text>
            {nota.is_locked && (
              <Text style={{ fontSize: 8, color: '#382f51' }}>NOTA BLOQUEADA</Text>
            )}
          </View>

          {nota.codigo_cie11 && (
            <View style={[pdfStyles.row, { marginBottom: 4 }]}>
              <Text style={[pdfStyles.label, { fontSize: 9 }]}>CIE-11:</Text>
              <Text style={[pdfStyles.value, { marginLeft: 4 }]}>
                {nota.codigo_cie11}
                {nota.descripcion_cie11 ? ` — ${nota.descripcion_cie11}` : ''}
              </Text>
            </View>
          )}

          <CampoSOAP letra="S" label="Subjetivo" value={nota.subjetivo} />
          <CampoSOAP letra="O" label="Objetivo" value={nota.objetivo} />
          <CampoSOAP letra="A" label="Análisis" value={nota.analisis} />
          <CampoSOAP letra="P" label="Plan" value={nota.plan} />
        </View>
      ))}
    </View>
  )
}
