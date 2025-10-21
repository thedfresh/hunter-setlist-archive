import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ClientLayoutShell from './ClientLayoutShell';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The Robert Hunter Performance Archive',
  description: 'Robert Hunter performance archive and setlist database',
  openGraph: {
    title: 'Robert Hunter Performance Archive',
    description: 'Comprehensive documentation of 600+ Robert Hunter performances spanning his complete musical career. Search setlists, venues, and recordings from the Grateful Dead lyricist\'s solo work and collaborations.',
    url: 'https://www.stillunsung.com',
    type: 'website',
    images: [
      {
        url: 'https://stillunsung.com/images/og-default.png',
        width: 200,
        height: 184,
        alt: 'Robert Hunter Performance Archive',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Robert Hunter Performance Archive',
    description: 'Comprehensive documentation of 600+ Robert Hunter performances spanning his complete musical career. Search setlists, venues, and recordings from the Grateful Dead lyricist\'s solo work and collaborations.',
    images: ['https://stillunsung.com/images/og-default.png'],
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ClientLayoutShell>{children}</ClientLayoutShell>
      </body>
    </html>
  );
}