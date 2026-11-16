import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  icons: { icon: "/brand/evernever-wordmark.svg" },
  title: {
    default: 'evernever — Creative & Strategic Agency',
    template: '%s | evernever',
  },
  description: 'เอเจนซี่ service support ที่บริการดูแลเพิ่มยอดขายให้กับธุรกิจ พร้อมผลิตสื่อโฆษณาทุกชนิดอย่างครบวงจร',
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    siteName: 'evernever',
    title: 'evernever — Creative & Strategic Agency',
    description: 'Present your story on Your way',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className="antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
