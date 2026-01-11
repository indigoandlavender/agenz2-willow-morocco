import type { Metadata } from 'next'
import { Inter, IBM_Plex_Mono } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Willow | Real Estate Intelligence',
  description: 'Proprietary data on Moroccan real estate. Alpha Gap analysis, structural health scoring, legal risk assessment.',
  keywords: ['morocco', 'real estate', 'marrakech', 'investment', 'riad', 'alpha'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable} dark`}>
      <body className="min-h-screen bg-[#0A0A0A] text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  )
}
