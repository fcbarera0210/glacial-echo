import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GLACIAL_ECHO.EXE // TERMINAL 01',
  description: 'Un juego de journaling RPG / Survival Horror ambientado en la Antártida',
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

