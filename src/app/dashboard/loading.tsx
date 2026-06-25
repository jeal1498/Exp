import styles from './layout.module.css'

export default function DashboardLoading() {
  return (
    <main id="main-content" className={styles.main} aria-busy="true" aria-label="Cargando…">
      <div
        style={{
          height: '24px',
          width: '180px',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 'var(--space-lg)',
          animation: 'pulse 1.4s ease-in-out infinite',
        }}
      />
      <div
        style={{
          height: '1px',
          width: '100%',
          background: 'var(--color-border)',
          marginBottom: 'var(--space-lg)',
        }}
      />
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            height: '44px',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--space-sm)',
            animation: `pulse 1.4s ease-in-out ${i * 0.1}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
    </main>
  )
}
