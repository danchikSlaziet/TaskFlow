import Link from 'next/link'
import {  ArrowLeft, LayoutDashboard } from 'lucide-react'
import { Button } from '@/shared/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <span className="mb-2 text-xl font-semibold uppercase tracking-wider text-muted-foreground">
          Ошибка 404
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Страница не найдена
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Запрашиваемая страница не существует, была перемещена или у вас нет прав для её просмотра.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild size="default" className="gap-2">
            <Link href="/projects">
              <LayoutDashboard className="h-4 w-4" />
              К проектам
            </Link>
          </Button>

          <Button asChild variant="outline" size="default" className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              На главную
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}