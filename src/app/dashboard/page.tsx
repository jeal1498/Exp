import { createClient } from '@/lib/supabase/server'
import styles from './page.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Panel Principal — Expedientes Clínicos' }

type PacienteRow = {
  id: string
  numero_expediente: string
  nombre: string
  apellido_paterno: string
  apellido_materno: string | null
  created_at: string
}

type NotaRow = {
  id: string
  fecha_nota: string
  subjetivo: string | null
  is_locked: boolean
  paciente_id: string
  pacientes:
    | { nombre: string; apellido_paterno: string }
    | { nombre: string; apellido_paterno: string }[]
    | null
}

function getPaciente(
  p: NotaRow['pacientes'],
): { nombre: string; apellido_paterno: string } | null {
  if (!p) return null
  return Array.isArray(p) ? (p[0] ?? null) : p
}

function formatFechaNota(fecha: string): string {
  return new Date(`${fecha}T12:00:00`).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const mesLabel =
    now
      .toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
      .replace(/^\w/, (c) => c.toUpperCase())

  const [
    { count: pacientesCount },
    { count: notasCount },
    { count: evaluacionesCount },
    { data: recentPacientes },
    { data: recentNotasRaw },
  ] = await Promise.all([
    supabase
      .from('pacientes')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('notas_evolucion')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', monthStart),
    supabase
      .from('evaluaciones_neuro')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', monthStart),
    supabase
      .from('pacientes')
      .select('id, numero_expediente, nombre, apellido_paterno, apellido_materno, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('notas_evolucion')
      .select('id, fecha_nota, subjetivo, is_locked, paciente_id, pacientes(nombre, apellido_paterno)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const recentPacientesList = (recentPacientes ?? []) as PacienteRow[]
  const recentNotas = (recentNotasRaw ?? []) as NotaRow[]

  return (
    <div className={styles.page}>
      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <div className={styles.statsStrip} role="region" aria-label="Resumen clínico">
        <div className={styles.stat}>
          <span className={styles.statValue}>{pacientesCount ?? 0}</span>
          <span className={styles.statLabel}>Pacientes activos</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{notasCount ?? 0}</span>
          <span className={styles.statLabel}>Notas de evolución</span>
          <span className={styles.statPeriod}>{mesLabel}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{evaluacionesCount ?? 0}</span>
          <span className={styles.statLabel}>Evaluaciones</span>
          <span className={styles.statPeriod}>{mesLabel}</span>
        </div>
      </div>

      {/* ── Two-column content ───────────────────────────────────────────── */}
      <div className={styles.content}>
        {/* Left: recent patients table */}
        <section className={styles.section} aria-labelledby="expedientes-title">
          <div className={styles.sectionHeader}>
            <h2 id="expedientes-title" className={styles.sectionTitle}>
              Expedientes recientes
            </h2>
            <a href="/dashboard/pacientes" className={styles.sectionAction}>
              Ver todos
            </a>
          </div>

          {recentPacientesList.length === 0 ? (
            <p className={styles.empty}>No hay expedientes registrados aún.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>No. Expediente</th>
                  <th className={styles.th}>Nombre</th>
                  <th className={styles.th}>Registrado</th>
                </tr>
              </thead>
              <tbody>
                {recentPacientesList.map((p) => (
                  <tr key={p.id} className={styles.tr}>
                    <td className={styles.td}>
                      <span className={styles.expediente}>{p.numero_expediente}</span>
                    </td>
                    <td className={styles.td}>
                      <a
                        href={`/dashboard/pacientes/${p.id}`}
                        className={styles.patientLink}
                      >
                        {p.nombre} {p.apellido_paterno}
                        {p.apellido_materno ? ` ${p.apellido_materno}` : ''}
                      </a>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.dateText}>
                        {new Date(p.created_at).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Right: sidebar */}
        <div className={styles.sidebar}>
          {/* Quick actions */}
          <section className={styles.section} aria-labelledby="acciones-title">
            <div className={styles.sectionHeader}>
              <h2 id="acciones-title" className={styles.sectionTitle}>
                Acciones rápidas
              </h2>
            </div>
            <div className={styles.actions}>
              <a href="/dashboard/pacientes/nuevo" className={styles.btnPrimary}>
                Nuevo expediente
              </a>
              <a href="/dashboard/pacientes" className={styles.btnGhost}>
                Ver todos los expedientes
              </a>
            </div>
          </section>

          {/* Recent SOAP notes */}
          <section className={styles.section} aria-labelledby="notas-title">
            <div className={styles.sectionHeader}>
              <h2 id="notas-title" className={styles.sectionTitle}>
                Notas recientes
              </h2>
            </div>

            {recentNotas.length === 0 ? (
              <p className={styles.empty}>No hay notas registradas aún.</p>
            ) : (
              <div className={styles.notesList}>
                {recentNotas.map((nota) => {
                  const paciente = getPaciente(nota.pacientes)
                  return (
                    <div key={nota.id} className={styles.noteItem}>
                      <div className={styles.noteHeader}>
                        {paciente ? (
                          <a
                            href={`/dashboard/pacientes/${nota.paciente_id}/notas`}
                            className={styles.notePatient}
                          >
                            {paciente.nombre} {paciente.apellido_paterno}
                          </a>
                        ) : (
                          <span className={styles.notePatient}>—</span>
                        )}
                        <span className={styles.noteDate}>
                          {formatFechaNota(nota.fecha_nota)}
                        </span>
                      </div>
                      {nota.is_locked ? (
                        <span className={`${styles.badge} ${styles.badgeLocked}`}>
                          NOM-004 ✓
                        </span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgeOpen}`}>
                          Abierta
                        </span>
                      )}
                      {nota.subjetivo && (
                        <p className={styles.noteSubject}>{nota.subjetivo}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
