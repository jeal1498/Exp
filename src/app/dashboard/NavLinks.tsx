'use client'

import { usePathname } from 'next/navigation'
import styles from './layout.module.css'

const navItems = [
  { href: '/dashboard', label: 'Inicio', exact: true },
  { href: '/dashboard/pacientes', label: 'Pacientes', exact: false },
]

export function NavLinks() {
  const pathname = usePathname()
  return (
    <nav className={styles.navLinks}>
      {navItems.map(({ href, label, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
          <a
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={`${styles.navLink}${isActive ? ` ${styles.navLinkActive}` : ''}`}
          >
            {label}
          </a>
        )
      })}
    </nav>
  )
}
