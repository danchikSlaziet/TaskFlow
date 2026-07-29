import { redirect } from 'next/navigation'
import { ROUTES } from '@/shared/config'
import { Header } from '@/widgets/Header'
import { ProjectList } from '@/widgets/ProjectList'
import { getCurrentUser } from '@/entities/user/index.server'



export default async function ProjectsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect(ROUTES.LOGIN)
  }

  return (
    <div className="space-y-6">
      <Header user={user} />
      <ProjectList />
    </div>
  )
}