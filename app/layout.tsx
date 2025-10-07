import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'
import ConditionalSiteHeader from './ConditionalSiteHeader';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'The Robert Hunter Performance Archive',
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
  <ConditionalSiteHeader />
        {children}
      </body>
    </html>
  )
}