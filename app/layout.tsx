import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ClientLayoutShell from './ClientLayoutShell';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The Robert Hunter Performance Archive | StillUnsung.com',
  description: 'Complete performance archive documenting Grateful Dead lyricist Robert Hunter\'s career as a performing musician (1961-2014). Search and explore over 600 shows including Hunter\'s work with Comfort, Roadhog, Dinosaurs and solo performances. Setlists, recordings, and research materials.',
  keywords: ['Robert Hunter', 'Grateful Dead', 'setlists', 'performances', 'Comfort', 'Roadhog', 'Dinosaurs', 'songwriter', 'live music archive'],
  authors: [{ name: 'Douglas Aldridge' }],
  openGraph: {
    title: 'The Robert Hunter Performance Archive',
    description: 'Complete performance archive documenting Grateful Dead lyricist Robert Hunter\'s career as a performing musician (1961-2014). Search and explore over 600 shows including Hunter\'s work with Comfort, Roadhog, Dinosaurs and solo performances. Setlists, recordings, and research materials.',
    url: 'https://www.stillunsung.com',
    siteName: 'StillUnsung.com',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://stillunsung.com/images/og-default.png',
        width: 1200,
        height: 630,
        alt: 'The Robert Hunter Performance Archive',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Robert Hunter Performance Archive',
    description: 'Complete performance archive documenting Grateful Dead lyricist Robert Hunter\'s career as a performing musician (1961-2014). Search and explore over 600 shows including Hunter\'s work with Comfort, Roadhog, Dinosaurs and solo performances. Setlists, recordings, and research materials.',
    images: ['https://stillunsung.com/images/og-default.png'],
    creator: '@sdfresh',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ClientLayoutShell>{children}</ClientLayoutShell>
      </body>
    </html>
  );
}