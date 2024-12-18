[V0_FILE]typescriptreact:file="app/layout.tsx"
import '../styles/globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Mitarbeiterverwaltung',
  description: 'Eine Anwendung zur Verwaltung von Mitarbeitern und deren Bewertungen',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>{children}</body>
    </html>
  )
}