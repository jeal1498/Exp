import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import styles from '../../pacientes.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Expediente Completo PDF — Expedientes Clínicos',
}

export default async function ExpedientePDFPage({
  params,
  searchParams,
}: {
  params: Promise<{ pacienteId: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { pacienteId } = await params
  const { error } = await searchParams
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('id, numero_expediente, nombre, apellido_paterno, apellido_materno, updated_at')
    .eq('id', pacienteId)
    .eq('is_active', true)
    .single()

  if (!paciente) redirect('/dashboard/pacientes')

  const [{ count: cntEval }, { count: cntNotas }, { count: cntBaterias }] =
    await Promise.all([
      supabase
        .from('evaluaciones_neuro')
        .select('*', { count: 'exact', head: true })
        .eq('paciente_id', pacienteId),
      supabase
        .from('notas_evolucion')
        .select('*', { count: 'exact', head: true })
        .eq('paciente_id', pacienteId),
      supabase
        .from('baterias_evaluacion')
        .select('*', { count: 'exact', head: true })
        .eq('paciente_id', pacienteId),
    ])

  const nombreCompleto = [
    paciente.nombre,
    paciente.apellido_paterno,
    paciente.apellido_materno,
  ]
    .filter(Boolean)
    .join(' ')

  const ultimaActualizacion = new Date(paciente.updated_at).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

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
            <a href={`/dashboard/pacientes/${pacienteId}`}>{nombreCompleto}</a>
          </li>
          <li className={styles.breadcrumbItem} aria-hidden="true">
            <span className={styles.breadcrumbSep}>›</span>
          </li>
          <li className={styles.breadcrumbItem} aria-current="page">
            Expediente PDF
          </li>
        </ol>
      </nav>

      <h1 className={styles.pageTitle}>Expediente Clínico Completo</h1>

      {error && (
        <p role="alert" className={styles.alert}>
          {decodeURIComponent(error)}
        </p>
      )}

      <dl className={styles.metaList}>
        <dt className={styles.metaLabel}>Paciente</dt>
        <dd className={styles.metaValue}>{nombreCompleto}</dd>

        <dt className={styles.metaLabel}>No. Expediente</dt>
        <dd className={`${styles.metaValue} ${styles.metaValueMono}`}>
          {paciente.numero_expediente}
        </dd>

        <dt className={styles.metaLabel}>Última actualización</dt>
        <dd className={styles.metaValue}>{ultimaActualizacion}</dd>

        <dt className={styles.metaLabel}>Evaluaciones incluidas</dt>
        <dd className={styles.metaValue}>{cntEval ?? 0}</dd>

        <dt className={styles.metaLabel}>Notas SOAP incluidas</dt>
        <dd className={styles.metaValue}>{cntNotas ?? 0}</dd>

        <dt className={styles.metaLabel}>Baterías incluidas</dt>
        <dd className={styles.metaValue}>{cntBaterias ?? 0}</dd>
      </dl>

      <p className={styles.helperText}>
        El PDF incluye ficha de identificación (NOM-004 art. 5.1), historia
        clínica, evaluaciones neuropsicológicas, notas SOAP e informe
        diagnóstico de todas las baterías registradas. El documento se genera
        en el servidor y no se almacena.
      </p>

      <div className={styles.formActions}>
        <a
          href={`/dashboard/pacientes/${pacienteId}/expediente/pdf`}
          className={styles.btnPrimary}
        >
          Descargar expediente completo PDF
        </a>
        <a
          href={`/dashboard/pacientes/${pacienteId}`}
          className={styles.btnGhost}
        >
          Volver al expediente
        </a>
      </div>
    </div>
  )
}
