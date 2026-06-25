import styles from './pacientes.module.css'

export default function PacientesLoading() {
  return (
    <div aria-busy="true" aria-label="Cargando pacientes…">
      <div className={styles.pageHeader}>
        <div
          style={{
            height: '28px',
            width: '140px',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-sm)',
            animation: 'pulse 1.4s ease-in-out infinite',
          }}
        />
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {['No. Expediente', 'Nombre', 'CURP', 'Fecha de nacimiento', 'Registrado'].map((h) => (
                <th key={h} scope="col" className={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className={styles.tr}>
                {[1, 2, 3, 4, 5].map((j) => (
                  <td key={j} className={styles.td}>
                    <div
                      style={{
                        height: '14px',
                        width: j === 2 ? '160px' : j === 3 ? '130px' : '80px',
                        background: 'var(--color-surface)',
                        borderRadius: 'var(--radius-sm)',
                        animation: `pulse 1.4s ease-in-out ${i * 0.08}s infinite`,
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
    </div>
  )
}
