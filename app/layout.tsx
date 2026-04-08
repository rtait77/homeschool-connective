import type { Metadata, Viewport } from 'next'
import { Nunito } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'Homeschool Connective',
  description: 'Interactive, game-based learning for homeschoolers and educators.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HC Games',
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} antialiased`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Script
          id="sender-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(s,e,n,d,er){s['Sender']=er;s[er]=s[er]||function(){(s[er].q=s[er].q||[]).push(arguments)},s[er].l=1*new Date();var a=e.createElement(n),m=e.getElementsByTagName(n)[0];a.async=1;a.src=d;m.parentNode.insertBefore(a,m)})(window,document,'script','https://cdn.sender.net/accounts_resources/universal.js','sender');sender('7c20d4cb647923')`,
          }}
        />
      </body>
    </html>
  )
}
