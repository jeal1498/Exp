import { View, Text } from '@react-pdf/renderer'
import { pdfStyles } from '../pdfStyles'
import type { Database, Json } from '@/types/database.types'

type Anamnesis = Database['public']['Tables']['anamnesis']['Row']

function Campo({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={pdfStyles.label}>{label}:</Text>
      <Text style={[pdfStyles.value, { marginTop: 2, lineHeight: 1.4 }]}>{value}</Text>
    </View>
  )
}

function renderHabitos(habitos: Json | null): Array<{ key: string; val: string }> {
  if (!habitos || typeof habitos !== 'object' || Array.isArray(habitos)) return []
  return Object.entries(habitos as Record<string, Json>)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => ({
      key: k.replace(/_/g, ' '),
      val: typeof v === 'boolean' ? (v ? 'Sí' : 'No') : String(v),
    }))
}

function renderMedicamentos(
  medicamentos: Json | null
): Array<{ nombre: string; dosis: string }> {
  if (!Array.isArray(medicamentos)) return []
  return (medicamentos as Json[]).filter(Boolean).map((m) => {
    const entry = m as Record<string, Json>
    return {
      nombre: String(entry.nombre ?? ''),
      dosis: String(entry.dosis ?? ''),
    }
  })
}

interface HistoriaClinicaProps {
  anamnesis: Anamnesis | null
}

export function HistoriaClinica({ anamnesis }: HistoriaClinicaProps) {
  if (!anamnesis) {
    return (
      <View>
        <Text style={pdfStyles.sectionTitle}>§2 Historia Clínica (NOM-004 art. 7.1)</Text>
        <Text style={[pdfStyles.value, { color: '#888' }]}>Sin historia clínica registrada.</Text>
      </View>
    )
  }

  const habitos = renderHabitos(anamnesis.habitos)
  const medicamentos = renderMedicamentos(anamnesis.medicamentos_actuales)

  return (
    <View>
      <Text style={pdfStyles.sectionTitle}>§2 Historia Clínica (NOM-004 art. 7.1)</Text>

      <Campo label="Antecedentes heredo-familiares" value={anamnesis.antecedentes_heredofamiliares} />
      <Campo label="Antecedentes personales patológicos" value={anamnesis.antecedentes_personales_patologicos} />
      <Campo label="Antecedentes perinatales" value={anamnesis.antecedentes_perinatales} />
      <Campo label="Desarrollo psicomotor" value={anamnesis.desarrollo_psicomotor} />
      <Campo label="Antecedentes escolares" value={anamnesis.antecedentes_escolares} />
      <Campo label="Antecedentes laborales" value={anamnesis.antecedentes_laborales} />
      <Campo label="Alergias" value={anamnesis.alergias} />

      {habitos.length > 0 && (
        <View style={{ marginBottom: 8 }}>
          <Text style={pdfStyles.label}>Hábitos:</Text>
          {habitos.map(({ key, val }) => (
            <View key={key} style={[pdfStyles.row, { marginTop: 2, paddingLeft: 8 }]}>
              <Text style={[pdfStyles.label, { width: 160, fontSize: 9 }]}>{key}:</Text>
              <Text style={pdfStyles.value}>{val}</Text>
            </View>
          ))}
        </View>
      )}

      {medicamentos.length > 0 && (
        <View style={{ marginBottom: 8 }}>
          <Text style={[pdfStyles.label, { marginBottom: 4 }]}>Medicamentos actuales:</Text>
          <View style={pdfStyles.row}>
            <Text style={[pdfStyles.label, { width: 200, fontSize: 9 }]}>Nombre</Text>
            <Text style={[pdfStyles.label, { flex: 1, fontSize: 9 }]}>Dosis</Text>
          </View>
          {medicamentos.map((med, i) => (
            <View key={i} style={[pdfStyles.row, { paddingLeft: 8 }]}>
              <Text style={[pdfStyles.value, { width: 200 }]}>{med.nombre}</Text>
              <Text style={[pdfStyles.value, { flex: 1 }]}>{med.dosis}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
