import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lista de Compras',
  description: 'Gerencie sua lista de compras',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-r from-orange-700 to-yellow-600">
        {children}
      </body>
    </html>
  )
}
