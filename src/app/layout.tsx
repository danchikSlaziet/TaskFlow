import { ThemeProvider } from '@/shared/ui/theme-provider'
import { Toaster } from '@/shared/ui/sonner'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { VersionGuard } from '@/shared/lib/version-guard'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
})

export const metadata: Metadata = {
  title: 'TaskFlow — Управление проектами и документами',
  description: 'Продвинутая система управления проектами, Kanban-досками и документами',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${inter.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <VersionGuard />
          {children}
          <Toaster /> 
        </ThemeProvider>
      </body>
    </html>
  )
}