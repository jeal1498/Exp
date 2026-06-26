import { View, Text } from '@react-pdf/renderer'
import { pdfStyles } from '../pdfStyles'
import type { Database } from '@/types/database.types'

type Paciente = Database['public']['Tables']['pacientes']['Row']

function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date()
  const nac = new Date(fechaNacimiento + 'T12:00:00')
  let edad = hoy.getFullYear() - nac.getFullYear()
  if (
    hoy.getMonth() < nac.getMonth() ||
    (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())
  ) edad--
  return edad
}

function formatFecha(fecha: string): string {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function Fila({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <View style={pdfStyles.row}>
      <Text style={[pdfStyles.label, { width: 170 }]}>{label}:</Text>
      <Text style={[pdfStyles.value, { flex: 1 }]}>{value}</Text>
    </View>
  )
}

interface FichaIdentificacionProps {
  paciente: Paciente
}

export function FichaIdentificacion({ paciente }: FichaIdentificacionProps) {
  const nombreCompleto = [paciente.nombre, paciente.apellido_paterno, paciente.apellido_materno]
    .filter(Boolean)
    .join(' ')
  const edad = calcularEdad(paciente.fecha_nacimiento)
  const mostrarTutor = edad < 18 || !!paciente.tutor_nombre

  return (
    <View>
      <Text style={pdfStyles.sectionTitle}>§1 Ficha de Identificación (NOM-004 art. 5.1)</Text>

      <Fila label="Nombre completo" value={nombreCompleto} />
      <Fila label="CURP" value={paciente.curp} />
      <Fila
        label="Fecha de nacimiento"
        value={`${formatFecha(paciente.fecha_nacimiento)} (${edad} años)`}
      />
      <Fila label="Sexo" value={paciente.sexo === 'M' ? 'Masculino' : 'Femenino'} />
      <Fila label="Lateralidad" value={paciente.lateralidad} />
      <Fila label="Lugar de nacimiento" value={paciente.lugar_nacimiento} />
      <Fila label="Estado civil" value={paciente.estado_civil} />
      <Fila label="Escolaridad" value={paciente.escolaridad} />
      <Fila label="Ocupación" value={paciente.ocupacion} />
      <Fila label="Domicilio" value={paciente.domicilio} />
      <Fila label="Teléfono" value={paciente.telefono} />
      <Fila label="Correo electrónico" value={paciente.email} />
      <Fila label="Médico referente" value={paciente.medico_referente} />

      {mostrarTutor && (
        <View style={{ marginTop: 8 }}>
          <Text style={[pdfStyles.label, { marginBottom: 4 }]}>
            Tutor / Responsable Legal:
          </Text>
          <Fila label="Nombre del tutor" value={paciente.tutor_nombre} />
          <Fila label="Relación" value={paciente.tutor_relacion} />
          <Fila label="Teléfono del tutor" value={paciente.tutor_telefono} />
        </View>
      )}

      <View style={[pdfStyles.row, { marginTop: 8 }]}>
        <Text style={[pdfStyles.label, { width: 170 }]}>Consentimiento informado:</Text>
        <Text style={pdfStyles.value}>
          {paciente.consentimiento_informado
            ? `Otorgado${paciente.consentimiento_fecha ? ` el ${formatFecha(paciente.consentimiento_fecha)}` : ''}`
            : 'Pendiente'}
        </Text>
      </View>

      <Fila label="Diagnóstico previo" value={paciente.diagnostico_previo} />
      <Fila label="Motivo de consulta" value={paciente.motivo_consulta} />
    </View>
  )
}
