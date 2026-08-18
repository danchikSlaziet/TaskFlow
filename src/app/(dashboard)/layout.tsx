import type { ReactNode } from 'react'
import { ThemeToggle } from '@/shared/ui/theme-toggle'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-background">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <main className="container mx-auto p-4 sm:p-8">{children}</main>
    </div>
  )
}
