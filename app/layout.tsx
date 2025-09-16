import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AE Gen – Apel Ewangeliczny',
  description: 'Generator apelu ewangelicznego dla skautów',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="min-h-screen antialiased bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
        {/* background accents */}
        <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        </div>
        <main className="relative z-10 container mx-auto max-w-4xl py-10 px-4 sm:py-14">
          {children}
        </main>
      </body>
    </html>
  )
}
