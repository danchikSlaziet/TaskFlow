import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/entities/user/index.server'
import { getProjectById } from '@/entities/project/index.server'
import { ROUTES } from '@/shared/config'
import { KanbanBoard } from '@/widgets/KanbanBoard'

interface ProjectPageProps {
  params: Promise<{
    projectId: string
  }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect(ROUTES.LOGIN)
  }

  const project = await getProjectById(projectId, user.id)

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        {project.description && (
          <p className="mt-1 text-muted-foreground">{project.description}</p>
        )}
      </div>
      <KanbanBoard key={project.id} projectId={project.id} initialColumns={project.columns} />
    </div>
  )
}