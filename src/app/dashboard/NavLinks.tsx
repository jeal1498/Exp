'use client'

import { usePathname } from 'next/navigation'
import styles from './layout.module.css'

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M3 10L11 3l8 7v8a1 1 0 0 1-1 1h-4v-5H9v5H4a1 1 0 0 1-1-1v-8Z"
        stroke="currentColor"
        strokeWidth={active ? 1.75 : 1.5}
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.12 : 0}
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PatientsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle
        cx="11"
        cy="8"
        r="3.5"
        stroke="currentColor"
        strokeWidth={active ? 1.75 : 1.5}
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.12 : 0}
      />
      <path
        d="M4 19c0-3.866 3.134-6 7-6s7 2.134 7 6"
        stroke="currentColor"
        strokeWidth={active ? 1.75 : 1.5}
        strokeLinecap="round"
      />
    </svg>
  )
}

const navItems = [
  {
    href: '/dashboard',
    label: 'Inicio',
    exact: true,
    Icon: HomeIcon,
  },
  {
    href: '/dashboard/pacientes',
    label: 'Pacientes',
    exact: false,
    Icon: PatientsIcon,
  },
]

export function NavLinks() {
  const pathname = usePathname()
  return (
    <>
      {navItems.map(({ href, label, exact, Icon }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
          <a
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={`${styles.navTab}${isActive ? ` ${styles.navTabActive}` : ''}`}
          >
            <Icon active={isActive} />
            <span>{label}</span>
          </a>
        )
      })}
    </>
  )
}
