import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Maven_Pro } from 'next/font/google'
import { AuthProvider } from '@/components/providers/auth-provider'
import { getUser } from '@/lib/supabase/server'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

const mavenPro = Maven_Pro({
  variable: '--font-maven-pro',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://underdog.ai'),
  title: {
    default: 'Underdog AI Sales Coach',
    template: '%s | Underdog AI',
  },
  description:
    'Master cold calling with AI-powered role-play practice, real-time coaching, and detailed performance analysis based on the proven Underdog methodology.',
  keywords: [
    'sales training',
    'cold calling',
    'AI coach',
    'sales roleplay',
    'objection handling',
    'sales methodology',
  ],
  authors: [{ name: 'Qualia Solutions' }],
  creator: 'Qualia Solutions',
  icons: {
    icon: '/underdog-logo.png',
    apple: '/underdog-logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Underdog AI Sales Coach',
    description:
      'Master cold calling with AI-powered role-play practice and real-time coaching.',
    siteName: 'Underdog AI',
    images: ['/underdog-logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Underdog AI Sales Coach',
    description:
      'Master cold calling with AI-powered role-play practice and real-time coaching.',
    images: ['/underdog-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#021945',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getUser()

  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${mavenPro.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider initialUser={user}>{children}</AuthProvider>
      </body>
    </html>
  )
}
