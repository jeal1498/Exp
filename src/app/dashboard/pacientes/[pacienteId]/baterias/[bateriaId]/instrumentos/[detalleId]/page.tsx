import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { insertAuditLog } from '@/lib/supabase/audit'
import { guardarPuntajes } from './actions'
import { FormConners3 } from '@/components/evaluaciones/FormConners3'
import { FormBrief2 } from '@/components/evaluaciones/FormBrief2'
import { FormAdos2 } from '@/components/evaluaciones/FormAdos2'
import { FormWiscV } from '@/components/evaluaciones/FormWiscV'
import { FormCaars2 } from '@/components/evaluaciones/FormCaars2'
import { FormCpt3 } from '@/components/evaluaciones/FormCpt3'
import styles from '../../../../../pacientes.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Captura de Puntajes — Expedientes Clínicos' }

const INFORMANTE_LABELS: Record<string, string> = {
  karen:       'Karen',
  padre:       'Padre',
  madre:       'Madre',
  maestro:     'Maestro',
  autoinforme: 'Autoinforme',
  observador:  'Observador',
}

export default async function InstrumentoDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ pacienteId: string; bateriaId: string; detalleId: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { pacienteId, bateriaId, detalleId } = await params
  const { error } = await searchParams
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('id, nombre, apellido_paterno')
    .eq('id', pacienteId)
    .eq('is_active', true)
    .single()

  const { data: bateria } = await supabase
    .from('baterias_evaluacion')
    .select('id, tipo, is_locked')
    .eq('id', bateriaId)
    .single()

  const { data: detalle, error: detalleError } = await supabase
    .from('evaluacion_instrumento_detalle')
    .select('id, instrumento_id, informante, nombre_informante, fecha_aplicacion, duracion_minutos, estado, puntajes_brutos, puntajes_estandar, observaciones_conductuales, instrumentos_catalogo(codigo, nombre_corto, nombre_completo)')
    .eq('id', detalleId)
    .single()

  await insertAuditLog(supabase, {
    usuario_id:     userData.user.id,
    tabla_afectada: 'evaluacion_instrumento_detalle',
    registro_id:    detalleId,
    accion:         'SELECT',
    datos_nuevos:   { paciente_id: pacienteId, bateria_id: bateriaId },
  })

  const nombrePaciente = paciente
    ? `${paciente.nombre} ${paciente.apellido_paterno}`
    : 'Paciente'

  const instrumento = detalle?.instrumentos_catalogo as { codigo: string; nombre_corto: string; nombre_completo: string } | null
  const codigo = instrumento?.codigo ?? ''
  const isLocked = bateria?.is_locked ?? false

  const action = guardarPuntajes.bind(null, detalleId, bateriaId, pacienteId)

  const TIPO_LABELS: Record<string, string> = {
    tdah_nino: 'TDAH Infantil', tdah_adulto: 'TDAH Adulto', tea: 'TEA / Autismo', personalizada: 'Personalizada',
  }

  return (
    <div>
      <nav aria-label="Migas de pan" className={styles.breadcrumb}>
        <ol className={styles.breadcrumbList}>
          <li className={styles.breadcrumbItem}>
            <a href="/dashboard/pacientes">Pacientes</a>
          </li>
          <li className={styles.breadcrumbItem} aria-hidden="true">
            <span className={styles.breadcrumbSep}>›</span>
          </li>
          <li className={styles.breadcrumbItem}>
            <a href={`/dashboard/pacientes/${pacienteId}`}>{nombrePaciente}</a>
          </li>
          <li className={styles.breadcrumbItem} aria-hidden="true">
            <span className={styles.breadcrumbSep}>›</span>
          </li>
          <li className={styles.breadcrumbItem}>
            <a href={`/dashboard/pacientes/${pacienteId}/baterias`}>Baterías</a>
          </li>
          <li className={styles.breadcrumbItem} aria-hidden="true">
            <span className={styles.breadcrumbSep}>›</span>
          </li>
          <li className={styles.breadcrumbItem}>
            <a href={`/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}`}>
              {bateria ? (TIPO_LABELS[bateria.tipo] ?? bateria.tipo) : 'Batería'}
            </a>
          </li>
          <li className={styles.breadcrumbItem} aria-hidden="true">
            <span className={styles.breadcrumbSep}>›</span>
          </li>
          <li className={styles.breadcrumbItem} aria-current="page">
            {instrumento?.nombre_corto ?? 'Instrumento'}
          </li>
        </ol>
      </nav>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {instrumento?.nombre_corto ?? 'Instrumento'}
          {detalle && (
            <span className={styles.pageSubtitle}>
              {' '}— {INFORMANTE_LABELS[detalle.informante] ?? detalle.informante}
            </span>
          )}
        </h1>
      </div>

      {instrumento?.nombre_completo && (
        <p className={styles.metaValue}>{instrumento.nombre_completo}</p>
      )}

      {(detalleError || !detalle) && (
        <p role="alert" className={styles.alert}>
          Instrumento no encontrado o sin acceso.
        </p>
      )}

      {error && (
        <p role="alert" className={styles.alert}>
          {decodeURIComponent(error)}
        </p>
      )}

      {isLocked && (
        <p className={`${styles.badge} ${styles.badgeLocked}`} style={{ marginBottom: 'var(--space-md)', display: 'inline-block' }}>
          La batería está firmada — solo lectura
        </p>
      )}

      {detalle && (
        <>
          {codigo === 'CONNERS3' && (
            <FormConners3 detalle={detalle} isLocked={isLocked} action={action} />
          )}
          {codigo === 'BRIEF2' && (
            <FormBrief2 detalle={detalle} isLocked={isLocked} action={action} />
          )}
          {codigo === 'ADOS2' && (
            <FormAdos2 detalle={detalle} isLocked={isLocked} action={action} />
          )}
          {codigo === 'WISCV' && (
            <FormWiscV detalle={detalle} isLocked={isLocked} action={action} />
          )}
          {codigo === 'CAARS2' && (
            <FormCaars2 detalle={detalle} isLocked={isLocked} action={action} />
          )}
          {codigo === 'CPT3' && (
            <FormCpt3 detalle={detalle} isLocked={isLocked} action={action} />
          )}
          {!['CONNERS3', 'BRIEF2', 'ADOS2', 'WISCV', 'CAARS2', 'CPT3'].includes(codigo) && (
            <p className={styles.empty}>No hay formulario disponible para este instrumento ({codigo}).</p>
          )}
        </>
      )}

      <a href={`/dashboard/pacientes/${pacienteId}/baterias/${bateriaId}`} className={styles.backLink}>
        <span aria-hidden="true">←</span>
        <span>Volver a la batería</span>
      </a>
    </div>
  )
}
