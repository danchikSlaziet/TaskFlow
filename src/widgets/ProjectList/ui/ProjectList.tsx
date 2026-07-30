import { ProjectCard } from '@/entities/project'
import { CreateProjectDialog } from '@/features/project-create'


interface ProjectListProps {
  projects: Array<{
    id: string
    name: string
    description?: string | null
    createdAt: Date
    _count: {
      columns: number
    }
  }>
}

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center">
        <h3 className="text-lg font-medium">Список проектов пуст</h3>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          Создайте свой первый проект, чтобы развернуть Kanban-доску!
        </p>
        <CreateProjectDialog />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Всего проектов: <span className="font-semibold text-foreground">{projects.length}</span>
        </p>
        <CreateProjectDialog />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}