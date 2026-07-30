import 'server-only'
import { prisma } from '@/shared/api'

export async function getUserProjects(userId: string) {
  return prisma.project.findMany({
    where: {
      ownerId: userId,
    },
    include: {
      _count: {
        select: {
          columns: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}