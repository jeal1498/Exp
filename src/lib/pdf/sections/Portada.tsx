import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    color: '#1a1a1a',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confidential: {
    fontSize: 8,
    color: '#888',
    letterSpacing: 1.5,
    marginBottom: 60,
    textAlign: 'center',
  },
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#382f51',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#515e71',
    marginBottom: 24,
    textAlign: 'center',
  },
  expediente: {
    fontSize: 11,
    color: '#515e71',
    marginBottom: 8,
    textAlign: 'center',
  },
  fecha: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#888',
    textAlign: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
    paddingTop: 6,
  },
})

interface PortadaProps {
  nombreCompleto: string
  numeroExpediente: string
  fechaGeneracion: string
}

export function Portada({ nombreCompleto, numeroExpediente, fechaGeneracion }: PortadaProps) {
  return (
    <Page size="LETTER" style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.confidential}>
          DOCUMENTO CONFIDENCIAL — Uso exclusivo del profesional tratante
        </Text>
        <Text style={styles.name}>{nombreCompleto}</Text>
        <Text style={styles.subtitle}>Expediente Clínico Completo</Text>
        <Text style={styles.expediente}>No. Expediente: {numeroExpediente}</Text>
        <Text style={styles.fecha}>Fecha de generación: {fechaGeneracion}</Text>
      </View>
      <View style={styles.footer}>
        <Text>Karen Trujillo — Neuropsicóloga | Cédula Profesional 11009616</Text>
      </View>
    </Page>
  )
}
