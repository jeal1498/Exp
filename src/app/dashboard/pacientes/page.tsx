import { createClient } from '@/lib/supabase/server'
import { formatFecha } from '@/lib/format'
import styles from './pacientes.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pacientes — Expedientes Clínicos' }

export default async function PacientesPage() {
  const supabase = await createClient()
  const { data: pacientes, error } = await supabase
    .from('pacientes')
    .select('id, numero_expediente, nombre, apellido_paterno, apellido_materno, fecha_nacimiento, curp, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Pacientes</h1>
        <a href="/dashboard/pacientes/nuevo" className={styles.pageAction}>
          + Registrar nuevo paciente
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
        <div
          className={styles.tableWrapper}
          role="region"
          aria-labelledby="tabla-pacientes-titulo"
          tabIndex={0}
        >
          <span id="tabla-pacientes-titulo" className="sr-only">
            Lista de pacientes
          </span>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className={styles.th}>No. Expediente</th>
                <th scope="col" className={styles.th}>Nombre</th>
                <th scope="col" className={styles.th}>CURP</th>
                <th scope="col" className={styles.th}>Fecha de nacimiento</th>
                <th scope="col" className={styles.th}>Registrado</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((p) => (
                <tr key={p.id} className={styles.tr}>
                  <td className={styles.td}>
                    <span className={styles.monoText}>{p.numero_expediente}</span>
                  </td>
                  <td className={styles.td}>
                    <a
                      href={`/dashboard/pacientes/${p.id}`}
                      className={styles.tableLink}
                    >
                      {p.nombre} {p.apellido_paterno} {p.apellido_materno ?? ''}
                    </a>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.monoText}>{p.curp}</span>
                  </td>
                  <td className={styles.td}>{formatFecha(p.fecha_nacimiento)}</td>
                  <td className={styles.td}>{formatFecha(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
