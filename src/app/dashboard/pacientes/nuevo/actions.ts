'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { validarCURP } from '@/lib/curp'

export async function crearPaciente(formData: FormData): Promise<never> {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const curp = (formData.get('curp') as string).trim().toUpperCase()
  const validacion = validarCURP(curp)
  if (!validacion.valida) {
    redirect(`/dashboard/pacientes/nuevo?error=${encodeURIComponent(validacion.error ?? 'CURP inválida')}`)
  }

  const consentimiento = formData.get('consentimiento_informado') === 'on'
  if (!consentimiento) {
    redirect('/dashboard/pacientes/nuevo?error=El+consentimiento+informado+es+obligatorio')
  }

  const year = new Date().getFullYear()
  const numero_expediente = `EXP-${year}-${Date.now().toString().slice(-7)}`

  const { error } = await supabase.from('pacientes').insert({
    numero_expediente,
    nombre: (formData.get('nombre') as string).trim(),
    apellido_paterno: (formData.get('apellido_paterno') as string).trim(),
    apellido_materno: ((formData.get('apellido_materno') as string) || '').trim() || null,
    fecha_nacimiento: formData.get('fecha_nacimiento') as string,
    curp,
    sexo: formData.get('sexo') as string,
    lateralidad: formData.get('lateralidad') as string,
    escolaridad: formData.get('escolaridad') as string,
    ocupacion: ((formData.get('ocupacion') as string) || '').trim() || null,
    domicilio: ((formData.get('domicilio') as string) || '').trim() || null,
    telefono: ((formData.get('telefono') as string) || '').trim() || null,
    email: ((formData.get('email') as string) || '').trim() || null,
    motivo_consulta: ((formData.get('motivo_consulta') as string) || '').trim() || null,
    consentimiento_informado: true,
    consentimiento_fecha: new Date().toISOString().split('T')[0],
    created_by: userData.user.id,
    is_active: true,
  })

  if (error) {
    const msg = error.code === '23505'
      ? 'Ya existe un paciente con esa CURP'
      : `Error al registrar paciente: ${error.message}`
    redirect(`/dashboard/pacientes/nuevo?error=${encodeURIComponent(msg)}`)
  }

  redirect('/dashboard/pacientes')
}
