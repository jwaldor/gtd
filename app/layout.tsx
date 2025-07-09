import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Navigation } from '@/components/navigation'
import { ChatPopup } from '@/components/chat-popup'

// comment

export const metadata: Metadata = {
  title: 'GTD Capture App',
  description: 'Getting Things Done capture and classification system',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main>
          {children}
        </main>
        <Toaster />
        <ChatPopup />
      </body>
    </html>
  )
}
