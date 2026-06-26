import { Document, Page, View, Text } from '@react-pdf/renderer'
import { pdfStyles } from './pdfStyles'
import { Portada } from './sections/Portada'
import { FichaIdentificacion } from './sections/FichaIdentificacion'
import { HistoriaClinica } from './sections/HistoriaClinica'
import { EvaluacionesNeuro } from './sections/EvaluacionesNeuro'
import { NotasEvolucion } from './sections/NotasEvolucion'
import { InformeDiagnostico } from './sections/InformeDiagnostico'
import type { Database } from '@/types/database.types'

type Paciente = Database['public']['Tables']['pacientes']['Row']
type Anamnesis = Database['public']['Tables']['anamnesis']['Row']
type EvaluacionNeuro = Database['public']['Tables']['evaluaciones_neuro']['Row']
type NotaEvolucion = Database['public']['Tables']['notas_evolucion']['Row']
type Bateria = Database['public']['Tables']['baterias_evaluacion']['Row']

export interface ExpedienteCompletoPDFProps {
  paciente: Paciente
  anamnesis: Anamnesis | null
  evaluaciones: EvaluacionNeuro[]
  notas: NotaEvolucion[]
  baterias: Bateria[]
  fechaGeneracion: string
}

export function ExpedienteCompletoPDF({
  paciente,
  anamnesis,
  evaluaciones,
  notas,
  baterias,
  fechaGeneracion,
}: ExpedienteCompletoPDFProps) {
  const nombreCompleto = [
    paciente.nombre,
    paciente.apellido_paterno,
    paciente.apellido_materno,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Document
      title={`Expediente — ${nombreCompleto}`}
      author="Karen Trujillo — Neuropsicóloga"
      subject="Expediente Clínico Completo"
    >
      <Portada
        nombreCompleto={nombreCompleto}
        numeroExpediente={paciente.numero_expediente}
        fechaGeneracion={fechaGeneracion}
      />

      <Page size="LETTER" style={pdfStyles.page}>
        {/* Pie de página fijo en cada hoja */}
        <View style={pdfStyles.footer} fixed>
          <Text>Karen Trujillo — Neuropsicóloga | Cédula Profesional 11009616</Text>
          <Text
            render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
          <Text>{fechaGeneracion}</Text>
        </View>

        <FichaIdentificacion paciente={paciente} />
        <HistoriaClinica anamnesis={anamnesis} />
        <EvaluacionesNeuro evaluaciones={evaluaciones} />
        <NotasEvolucion notas={notas} />
        <InformeDiagnostico baterias={baterias} />
      </Page>
    </Document>
  )
}
