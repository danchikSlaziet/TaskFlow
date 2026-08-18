import { LogoutButton } from '@/features/auth'
import { User } from 'lucide-react'

interface HeaderProps {
  user: {
    name?: string | null
    email: string
  }
}

export function Header({ user }: HeaderProps) {
  const displayName = user.name || user.email

  return (
    <header className="flex flex-col gap-4 border-b pb-4 pr-10 sm:flex-row sm:items-center sm:justify-between sm:pr-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Проекты</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Управляйте вашими проектами и задачами
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Плашка пользователя в стиле Linear */}
        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="max-w-[160px] truncate font-medium text-foreground sm:max-w-[200px]">
            {displayName}
          </span>
        </div>
        <LogoutButton />
      </div>
    </header>
  )
}
