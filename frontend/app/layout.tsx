// app/layout.tsx
import type { Metadata } from 'next'
import { Inter, Source_Serif_4 } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Navigation } from '@/components/navigation/Navigation'
import { AuthProvider } from '@/components/providers/AuthProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-source-serif',
})

export const metadata: Metadata = {
  title: 'PhysioCheck - Your Virtual Therapist',
  description: 'Professional physiotherapy platform for doctors and patients',
  keywords: ['physiotherapy', 'rehabilitation', 'healthcare', 'wellness'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} ${sourceSerif.variable} font-sans h-full`}>
        <Providers>
          <AuthProvider>
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
              <Navigation />
              <main className="pt-16">
                {children}
              </main>
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}