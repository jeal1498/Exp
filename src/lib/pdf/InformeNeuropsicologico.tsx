import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10 },
  header: { marginBottom: 20, borderBottom: '2pt solid #382f51', paddingBottom: 10 },
  clinicianName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#382f51' },
  cedula: { fontSize: 9, color: '#515e71', marginTop: 2 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#382f51',
    marginTop: 16,
    marginBottom: 6,
    borderBottom: '1pt solid #d0d0e7',
    paddingBottom: 4,
  },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 140, fontFamily: 'Helvetica-Bold', color: '#515e71' },
  value: { flex: 1 },
  instrumentoRow: { flexDirection: 'row', marginBottom: 3, paddingLeft: 8 },
  puntajeRow: { flexDirection: 'row', marginBottom: 2, paddingLeft: 16 },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#515e71',
  },
})

interface InformeProps {
  paciente: {
    nombre: string
    apellido_paterno: string
    apellido_materno?: string | null
    fecha_nacimiento: string
    sexo: string
    escolaridad?: string | null
  }
  bateria: {
    tipo: string
    motivo_consulta?: string | null
    impresion_diagnostica?: string | null
    recomendaciones?: string | null
    locked_at?: string | null
  }
  instrumentos: Array<{
    nombre_corto: string
    informante: string
    nombre_informante?: string | null
    fecha_aplicacion?: string | null
    puntajes_brutos: Record<string, unknown>
  }>
  fechaInforme: string
}

function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date()
  const nac = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nac.getFullYear()
  if (
    hoy.getMonth() < nac.getMonth() ||
    (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())
  ) edad--
  return edad
}

function formatFechaPDF(fecha: string): string {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const TIPO_LABELS: Record<string, string> = {
  tdah_nino:    'TDAH Infantil',
  tdah_adulto:  'TDAH Adulto',
  tea:          'TEA / Autismo',
  personalizada: 'Personalizada',
}

const INFORMANTE_LABELS: Record<string, string> = {
  karen:       'Karen (evaluador)',
  padre:       'Padre',
  madre:       'Madre',
  maestro:     'Maestro',
  autoinforme: 'Autoinforme',
  observador:  'Observador',
}

export function InformeNeuropsicologico({
  paciente,
  bateria,
  instrumentos,
  fechaInforme,
}: InformeProps) {
  const nombreCompleto = [paciente.nombre, paciente.apellido_paterno, paciente.apellido_materno]
    .filter(Boolean)
    .join(' ')
  const edad = calcularEdad(paciente.fecha_nacimiento)

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.clinicianName}>Karen Trujillo · Neuropsicóloga</Text>
          <Text style={styles.cedula}>Cédula Profesional: 11009616 · Cancún, Quintana Roo</Text>
          <Text style={[styles.cedula, { marginTop: 6 }]}>
            Informe de Evaluación Neuropsicológica · {TIPO_LABELS[bateria.tipo] ?? bateria.tipo} · {fechaInforme}
          </Text>
        </View>

        {/* Datos del paciente */}
        <Text style={styles.sectionTitle}>Datos del Paciente</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value}>{nombreCompleto}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fecha de nacimiento:</Text>
          <Text style={styles.value}>
            {formatFechaPDF(paciente.fecha_nacimiento)} ({edad} años)
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Sexo:</Text>
          <Text style={styles.value}>{paciente.sexo}</Text>
        </View>
        {paciente.escolaridad && (
          <View style={styles.row}>
            <Text style={styles.label}>Escolaridad:</Text>
            <Text style={styles.value}>{paciente.escolaridad}</Text>
          </View>
        )}

        {/* Motivo de consulta */}
        {bateria.motivo_consulta && (
          <>
            <Text style={styles.sectionTitle}>Motivo de Consulta</Text>
            <Text>{bateria.motivo_consulta}</Text>
          </>
        )}

        {/* Instrumentos aplicados */}
        <Text style={styles.sectionTitle}>Instrumentos Aplicados</Text>
        {instrumentos.map((inst, i) => (
          <View key={i} style={styles.instrumentoRow}>
            <Text>
              {'• '}{inst.nombre_corto}
              {' — Informante: '}{inst.nombre_informante || INFORMANTE_LABELS[inst.informante] || inst.informante}
              {inst.fecha_aplicacion ? ` · ${formatFechaPDF(inst.fecha_aplicacion)}` : ''}
            </Text>
          </View>
        ))}

        {/* Resultados por instrumento */}
        <Text style={styles.sectionTitle}>Resultados por Instrumento</Text>
        {instrumentos.map((inst, i) => (
          <View key={i}>
            <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 4, marginTop: 8 }}>
              {inst.nombre_corto} ({INFORMANTE_LABELS[inst.informante] ?? inst.informante})
            </Text>
            {Object.entries(inst.puntajes_brutos ?? {})
              .filter(([, v]) => v !== null && v !== undefined)
              .map(([k, v]) => (
                <View key={k} style={styles.puntajeRow}>
                  <Text style={[styles.label, { width: 160, fontSize: 9 }]}>
                    {k.replace(/_/g, ' ')}:
                  </Text>
                  <Text style={styles.value}>{String(v)}</Text>
                </View>
              ))}
          </View>
        ))}

        {/* Impresión diagnóstica */}
        {bateria.impresion_diagnostica && (
          <>
            <Text style={styles.sectionTitle}>Impresión Diagnóstica</Text>
            <Text>{bateria.impresion_diagnostica}</Text>
          </>
        )}

        {/* Recomendaciones */}
        {bateria.recomendaciones && (
          <>
            <Text style={styles.sectionTitle}>Recomendaciones</Text>
            <Text>{bateria.recomendaciones}</Text>
          </>
        )}

        {/* Firma */}
        <View style={{ marginTop: 40, alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>Psicóloga Karen Trujillo</Text>
          <Text style={{ fontSize: 9, color: '#515e71' }}>Cédula Profesional 11009616</Text>
          {bateria.locked_at && (
            <Text style={{ fontSize: 9, color: '#515e71', marginTop: 4 }}>
              Firmado el {bateria.locked_at}
            </Text>
          )}
        </View>

        <Text style={styles.footer} fixed>
          Documento generado por PsychoCore · Información confidencial sujeta a secreto profesional
        </Text>
      </Page>
    </Document>
  )
}
