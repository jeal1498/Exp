'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { validarCURP } from '@/lib/curp'

const TUTOR_RELACIONES = ['Padre', 'Madre', 'Abuelo/a', 'Tutor legal', 'Otro'] as const
type TutorRelacion = (typeof TUTOR_RELACIONES)[number]

const ESTADOS_CIVILES = [
  'Soltero/a',
  'Casado/a',
  'Divorciado/a',
  'Viudo/a',
  'Unión libre',
  'No aplica',
] as const
type EstadoCivil = (typeof ESTADOS_CIVILES)[number]

function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date()
  const nac = new Date(fechaNacimiento + 'T12:00:00')
  let edad = hoy.getFullYear() - nac.getFullYear()
  if (
    hoy.getMonth() < nac.getMonth() ||
    (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())
  )
    edad--
  return edad
}

export async function crearPaciente(formData: FormData): Promise<never> {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const curp = (formData.get('curp') as string).trim().toUpperCase()
  const validacion = validarCURP(curp)
  if (!validacion.valida) {
    redirect(
      `/dashboard/pacientes/nuevo?error=${encodeURIComponent(validacion.error ?? 'CURP inválida')}`
    )
  }

  const consentimiento = formData.get('consentimiento_informado') === 'on'
  if (!consentimiento) {
    redirect(
      '/dashboard/pacientes/nuevo?error=El+consentimiento+informado+es+obligatorio'
    )
  }

  const fechaNacimiento = formData.get('fecha_nacimiento') as string
  const esMenor = calcularEdad(fechaNacimiento) < 18

  const tutorNombre =
    ((formData.get('tutor_nombre') as string) || '').trim() || null
  const tutorRelacionRaw =
    ((formData.get('tutor_relacion') as string) || '').trim()
  const tutorRelacion: TutorRelacion | null = (
    TUTOR_RELACIONES as readonly string[]
  ).includes(tutorRelacionRaw)
    ? (tutorRelacionRaw as TutorRelacion)
    : null
  const tutorTelefono =
    ((formData.get('tutor_telefono') as string) || '').trim() || null

  if (esMenor && (!tutorNombre || !tutorRelacion)) {
    redirect(
      `/dashboard/pacientes/nuevo?error=${encodeURIComponent(
        'El nombre y relación del tutor son obligatorios para pacientes menores de 18 años'
      )}`
    )
  }

  const estadoCivilRaw = ((formData.get('estado_civil') as string) || '').trim()
  const estadoCivil: EstadoCivil | null = (
    ESTADOS_CIVILES as readonly string[]
  ).includes(estadoCivilRaw)
    ? (estadoCivilRaw as EstadoCivil)
    : null

  const lugarNacimiento =
    ((formData.get('lugar_nacimiento') as string) || '').trim() || null

  const year = new Date().getFullYear()
  const numero_expediente = `EXP-${year}-${Date.now().toString().slice(-7)}`

  const { error } = await supabase.from('pacientes').insert({
    numero_expediente,
    nombre: (formData.get('nombre') as string).trim(),
    apellido_paterno: (formData.get('apellido_paterno') as string).trim(),
    apellido_materno:
      ((formData.get('apellido_materno') as string) || '').trim() || null,
    fecha_nacimiento: fechaNacimiento,
    curp,
    sexo: formData.get('sexo') as string,
    lateralidad: formData.get('lateralidad') as string,
    escolaridad: formData.get('escolaridad') as string,
    ocupacion:
      ((formData.get('ocupacion') as string) || '').trim() || null,
    domicilio:
      ((formData.get('domicilio') as string) || '').trim() || null,
    telefono:
      ((formData.get('telefono') as string) || '').trim() || null,
    email: ((formData.get('email') as string) || '').trim() || null,
    motivo_consulta:
      ((formData.get('motivo_consulta') as string) || '').trim() || null,
    tutor_nombre: tutorNombre,
    tutor_relacion: tutorRelacion,
    tutor_telefono: tutorTelefono,
    lugar_nacimiento: lugarNacimiento,
    estado_civil: estadoCivil,
    consentimiento_informado: true,
    consentimiento_fecha: new Date().toISOString().split('T')[0],
    created_by: userData.user.id,
    is_active: true,
  })

  if (error) {
    const msg =
      error.code === '23505'
        ? 'Ya existe un paciente con esa CURP'
        : `Error al registrar paciente: ${error.message}`
    redirect(
      `/dashboard/pacientes/nuevo?error=${encodeURIComponent(msg)}`
    )
  }

  redirect('/dashboard/pacientes')
}
