import type { Metadata } from 'next'
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: 'TIFORT-CORE | Forensic Real Estate Intelligence',
  description: 'Institutional-grade property verification and valuation for the Moroccan market. Beyond probability — forensic certainty.',
  keywords: ['real estate', 'morocco', 'marrakech', 'property', 'investment', 'forensic', 'valuation'],
  authors: [{ name: 'TIFORT' }],
  openGraph: {
    title: 'TIFORT-CORE | Forensic Real Estate Intelligence',
    description: 'Institutional-grade property verification and valuation for the Moroccan market.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen bg-primary-50 antialiased">
        {children}
      </body>
    </html>
  )
}
