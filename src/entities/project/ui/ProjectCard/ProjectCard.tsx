import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/shared/ui/card'
import { FolderKanban, Columns3 } from 'lucide-react'
import { pluralize } from '@/shared/lib'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description?: string | null
    createdAt: Date
    _count: {
      columns: number
    }
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const formattedDate = new Date(project.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const columnsText = pluralize(project._count.columns, 'колонка', 'колонки', 'колонок')

  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <Card className="h-full transition-all hover:border-foreground/20 hover:shadow-sm">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <FolderKanban className="h-5 w-5" />
              <CardTitle className="text-xl group-hover:text-primary">
                {project.name}
              </CardTitle>
            </div>
          </div>
          {project.description && (
            <CardDescription className="line-clamp-2">
              {project.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardFooter className="mt-auto flex items-center justify-between text-xs text-muted-foreground pt-4">
          <div className="flex items-center gap-1.5">
            <Columns3 className="h-3.5 w-3.5" />
            <span>{columnsText}</span>
          </div>
          <span>{formattedDate}</span>
        </CardFooter>
      </Card>
    </Link>
  )
}