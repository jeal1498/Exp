import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { Json } from '@/types/database.types'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 48,
    paddingBottom: 60,
    paddingHorizontal: 48,
    color: '#1a1a1a',
  },
  header: {
    borderBottom: '2pt solid #2a2a6e',
    paddingBottom: 10,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: '#2a2a6e',
  },
  headerSub: {
    fontSize: 9,
    color: '#555',
    marginTop: 2,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#2a2a6e',
    borderBottom: '1pt solid #c0c0e0',
    paddingBottom: 3,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    fontFamily: 'Helvetica-Bold',
    width: 160,
    flexShrink: 0,
  },
  value: {
    flex: 1,
  },
  bodyText: {
    lineHeight: 1.5,
    marginBottom: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e8e8f0',
    padding: '4 6',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #ddd',
    padding: '3 6',
    fontSize: 9,
  },
  col1: { width: '30%' },
  col2: { width: '20%' },
  col3: { width: '50%' },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 9,
    color: '#fff',
    backgroundColor: '#c0392b',
  },
  firmadoBanner: {
    position: 'absolute',
    top: 180,
    left: 80,
    fontSize: 60,
    color: '#c0392b',
    opacity: 0.12,
    fontFamily: 'Helvetica-Bold',
    transform: 'rotate(-35deg)',
  },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 48,
    right: 48,
    borderTop: '0.5pt solid #ccc',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#888',
  },
  signature: {
    marginTop: 32,
    borderTop: '1pt solid #444',
    paddingTop: 8,
    alignSelf: 'flex-end',
    width: 240,
    textAlign: 'center',
  },
})

function edadTexto(fechaNacimiento: string): string {
  const birth = new Date(fechaNacimiento)
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth()
  const adjusted = months < 0 ? years - 1 : years
  const adjMonths = months < 0 ? 12 + months : months
  return `${adjusted} años ${adjMonths} meses`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Cancun' })
}

function entryPairs(obj: Record<string, unknown>): [string, string][] {
  return Object.entries(obj)
    .filter(([k]) => !k.endsWith('_categoria'))
    .map(([k, v]) => [k, String(v)])
}

export interface InformeProps {
  bateria: {
    id: string
    tipo: string
    estado: string
    motivo_consulta: string | null
    observaciones_generales: string | null
    impresion_diagnostica: string | null
    recomendaciones: string | null
    created_at: string
    informe_generado_at: string | null
    is_locked: boolean
    locked_at: string | null
    hash_integridad: string | null
  }
  paciente: {
    nombre: string
    apellido_paterno: string
    apellido_materno: string | null
    fecha_nacimiento: string
    sexo: string
    escolaridad: string | null
    numero_expediente: string
  }
  detalles: Array<{
    id: string
    informante: string
    nombre_informante: string | null
    fecha_aplicacion: string | null
    instrumento_nombre: string
    instrumento_codigo: string
    puntajes_estandar: Json | null
  }>
}

export function InformeNeuropsicologico({ bateria, paciente, detalles, firmado }: InformeProps & { firmado?: boolean }) {
  const nombreCompleto = `${paciente.nombre} ${paciente.apellido_paterno}${paciente.apellido_materno ? ' ' + paciente.apellido_materno : ''}`
  const fechaInforme = formatDate(bateria.informe_generado_at ?? bateria.created_at)

  return (
    <Document
      title={`Informe Neuropsicológico — ${nombreCompleto}`}
      author="Karen Trujillo — Neuropsicóloga"
    >
      <Page size="LETTER" style={styles.page}>
        {firmado && (
          <Text style={styles.firmadoBanner}>FIRMADO</Text>
        )}

        {/* 1. Encabezado */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Informe de Evaluación Neuropsicológica</Text>
          <Text style={styles.headerSub}>Psicóloga Karen Trujillo · Cédula Profesional 11009616</Text>
          <Text style={styles.headerSub}>Fecha del informe: {fechaInforme}</Text>
          {firmado && bateria.locked_at && (
            <Text style={styles.headerSub}>Firmado electrónicamente: {formatDate(bateria.locked_at)}</Text>
          )}
        </View>

        {/* 2. Datos del paciente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Paciente</Text>
          <View style={styles.row}><Text style={styles.label}>Nombre:</Text><Text style={styles.value}>{nombreCompleto}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Expediente:</Text><Text style={styles.value}>{paciente.numero_expediente}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Fecha de nacimiento:</Text><Text style={styles.value}>{formatDate(paciente.fecha_nacimiento)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Edad al evaluar:</Text><Text style={styles.value}>{edadTexto(paciente.fecha_nacimiento)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Sexo:</Text><Text style={styles.value}>{paciente.sexo}</Text></View>
          {paciente.escolaridad && (
            <View style={styles.row}><Text style={styles.label}>Escolaridad:</Text><Text style={styles.value}>{paciente.escolaridad}</Text></View>
          )}
        </View>

        {/* 3. Motivo de consulta */}
        {bateria.motivo_consulta && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Motivo de Consulta</Text>
            <Text style={styles.bodyText}>{bateria.motivo_consulta}</Text>
          </View>
        )}

        {/* 4. Instrumentos aplicados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instrumentos Aplicados</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Instrumento</Text>
            <Text style={styles.col2}>Informante</Text>
            <Text style={styles.col3}>Fecha de aplicación</Text>
          </View>
          {detalles.map(d => (
            <View key={d.id} style={styles.tableRow}>
              <Text style={styles.col1}>{d.instrumento_nombre}</Text>
              <Text style={styles.col2}>{d.nombre_informante ?? d.informante}</Text>
              <Text style={styles.col3}>{d.fecha_aplicacion ? formatDate(d.fecha_aplicacion) : '—'}</Text>
            </View>
          ))}
        </View>

        {/* 5. Resultados por instrumento */}
        {detalles.map(d => {
          const puntajes = d.puntajes_estandar as Record<string, unknown> | null
          if (!puntajes) return null
          const pairs = entryPairs(puntajes)
          if (pairs.length === 0) return null

          return (
            <View key={d.id + '_res'} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {d.instrumento_nombre} — {d.nombre_informante ?? d.informante}
              </Text>
              <View style={styles.tableHeader}>
                <Text style={{ width: '50%' }}>Subescala / Índice</Text>
                <Text style={{ width: '25%' }}>Puntaje</Text>
                <Text style={{ width: '25%' }}>Interpretación</Text>
              </View>
              {pairs.map(([k, v]) => {
                const cat = puntajes[`${k}_categoria`] as string | undefined
                return (
                  <View key={k} style={styles.tableRow}>
                    <Text style={{ width: '50%' }}>{k}</Text>
                    <Text style={{ width: '25%' }}>{v}</Text>
                    <Text style={{ width: '25%', color: cat?.includes('significativo') ? '#c0392b' : '#444' }}>
                      {cat ?? ''}
                    </Text>
                  </View>
                )
              })}
            </View>
          )
        })}

        {/* 7. Impresión diagnóstica */}
        {bateria.impresion_diagnostica && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Impresión Diagnóstica</Text>
            <Text style={styles.bodyText}>{bateria.impresion_diagnostica}</Text>
          </View>
        )}

        {/* 8. Recomendaciones */}
        {bateria.recomendaciones && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recomendaciones</Text>
            <Text style={styles.bodyText}>{bateria.recomendaciones}</Text>
          </View>
        )}

        {/* 9. Firma */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24 }}>
          <View style={styles.signature}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10 }}>Psicóloga Karen Trujillo</Text>
            <Text style={{ fontSize: 9, color: '#555', marginTop: 2 }}>Cédula Profesional 11009616</Text>
            <Text style={{ fontSize: 9, color: '#555' }}>{fechaInforme}</Text>
          </View>
        </View>

        {/* Hash de integridad si está firmado */}
        {firmado && bateria.hash_integridad && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 7, color: '#aaa' }}>
              SHA-256: {bateria.hash_integridad}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>PsychoCore · Expedientes Clínicos Neuropsicológicos</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
