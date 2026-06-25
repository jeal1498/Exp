import { createClient } from '@/lib/supabase/server'
import styles from './pacientes.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pacientes — Expedientes Clínicos' }

const PAGE_SIZE = 20

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  const supabase = await createClient()
  const { data: pacientes, error, count } = await supabase
    .from('pacientes')
    .select('id, numero_expediente, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, curp, created_at', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Pacientes</h1>
        <a href="/dashboard/pacientes/nuevo" className={styles.pageAction}>
          + Nuevo
        </a>
      </div>

      {error && (
        <p role="alert" className={styles.alert}>
          Error al cargar pacientes: {error.message}
        </p>
      )}

      {!pacientes || pacientes.length === 0 ? (
        <p className={styles.empty}>
          No hay pacientes registrados.{' '}
          <a href="/dashboard/pacientes/nuevo" className={styles.tableLink}>
            Registra el primero.
          </a>
        </p>
      ) : (
        <>
          <ul className={styles.patientList} role="list" aria-label="Lista de pacientes">
            {pacientes.map((p) => (
              <li key={p.id}>
                <a
                  href={`/dashboard/pacientes/${p.id}`}
                  className={styles.patientCard}
                >
                  <div className={styles.patientCardBody}>
                    <span className={styles.patientCardName}>
                      {p.nombre} {p.apellido_paterno}{p.apellido_materno ? ` ${p.apellido_materno}` : ''}
                    </span>
                    <span className={styles.patientCardMeta}>
                      <span>{p.numero_expediente}</span>
                      <span className={styles.patientCardMetaDot}>·</span>
                      <span>{p.curp}</span>
                    </span>
                  </div>
                  <svg
                    className={styles.patientCardChevron}
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav aria-label="Paginación de pacientes" className={styles.pagination}>
              {page > 1 ? (
                <a
                  href={`/dashboard/pacientes?page=${page - 1}`}
                  className={styles.paginationBtn}
                  aria-label="Página anterior"
                >
                  ← Anterior
                </a>
              ) : (
                <span className={`${styles.paginationBtn} ${styles.paginationBtnDisabled}`} aria-disabled="true">
                  ← Anterior
                </span>
              )}

              <span className={styles.paginationInfo}>
                Página {page} de {totalPages}
                {count !== null && <span className={styles.paginationCount}> — {count} pacientes</span>}
              </span>

              {page < totalPages ? (
                <a
                  href={`/dashboard/pacientes?page=${page + 1}`}
                  className={styles.paginationBtn}
                  aria-label="Página siguiente"
                >
                  Siguiente →
                </a>
              ) : (
                <span className={`${styles.paginationBtn} ${styles.paginationBtnDisabled}`} aria-disabled="true">
                  Siguiente →
                </span>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  )
}
