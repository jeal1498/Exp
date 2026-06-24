import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Expedientes Clínicos — Neuropsicología',
  description: 'Sistema de Gestión de Expedientes Clínicos (NOM-004 / NOM-024)',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
