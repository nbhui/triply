import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import AppShell from '@/components/layout/AppShell'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'Triply — Plan, Search, Book',
  description: 'Search flights, hotels, and car rentals. Track your full trip budget in one dashboard.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
