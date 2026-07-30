import 'server-only'
import { prisma } from '@/shared/api'

export async function getProjectById(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: userId,
    },
    include: {
      columns: {
        orderBy: {
          order: 'asc',
        },
        include: {
          tasks: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      },
    },
  })
}