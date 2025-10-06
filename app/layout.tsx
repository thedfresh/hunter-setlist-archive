import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'
import SiteHeader from '@/components/ui/SiteHeader';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hunter Setlist Archive',
  description: 'Robert Hunter performance archive and setlist database',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}