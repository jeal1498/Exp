import { View, Text } from '@react-pdf/renderer'
import { pdfStyles } from '../pdfStyles'
import type { Database } from '@/types/database.types'

type Bateria = Database['public']['Tables']['baterias_evaluacion']['Row']

const TIPO_LABELS: Record<string, string> = {
  tdah_nino: 'TDAH Infantil',
  tdah_adulto: 'TDAH Adulto',
  tea: 'TEA / Autismo',
  personalizada: 'Personalizada',
}

const ESTADO_LABELS: Record<string, string> = {
  en_curso: 'En curso',
  puntuacion_pendiente: 'Puntuación pendiente',
  borrador_informe: 'Borrador',
  firmado: 'Firmado',
  entregado: 'Entregado',
}

function formatFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

interface InformeDiagnosticoProps {
  baterias: Bateria[]
}

export function InformeDiagnostico({ baterias }: InformeDiagnosticoProps) {
  const bateriasConInforme = baterias.filter(
    (b) => b.impresion_diagnostica || b.recomendaciones
  )

  if (bateriasConInforme.length === 0) {
    return (
      <View>
        <Text style={pdfStyles.sectionTitle}>§5 Informe Diagnóstico</Text>
        <Text style={[pdfStyles.value, { color: '#888' }]}>
          Sin informe diagnóstico registrado.
        </Text>
      </View>
    )
  }

  return (
    <View>
      <Text style={pdfStyles.sectionTitle}>§5 Informe Diagnóstico</Text>

      {bateriasConInforme.map((bateria) => (
        <View key={bateria.id} style={{ marginBottom: 16 }}>
          <View style={[pdfStyles.row, { marginBottom: 6 }]}>
            <Text style={[pdfStyles.label, { flex: 1 }]}>
              {TIPO_LABELS[bateria.tipo] ?? bateria.tipo}
            </Text>
            <Text style={{ fontSize: 9, color: '#666' }}>
              {ESTADO_LABELS[bateria.estado] ?? bateria.estado}
              {bateria.is_locked && bateria.locked_at
                ? ` — Firmado el ${formatFecha(bateria.locked_at)}`
                : ''}
            </Text>
          </View>

          {bateria.impresion_diagnostica && (
            <View style={{ marginBottom: 8 }}>
              <Text style={[pdfStyles.label, { marginBottom: 3 }]}>
                Impresión Diagnóstica:
              </Text>
              <Text style={[pdfStyles.value, { lineHeight: 1.5 }]}>
                {bateria.impresion_diagnostica}
              </Text>
            </View>
          )}

          {bateria.recomendaciones && (
            <View style={{ marginBottom: 4 }}>
              <Text style={[pdfStyles.label, { marginBottom: 3 }]}>
                Recomendaciones:
              </Text>
              <Text style={[pdfStyles.value, { lineHeight: 1.5 }]}>
                {bateria.recomendaciones}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  )
}
