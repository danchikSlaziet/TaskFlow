import { verifySession } from '@/shared/lib/auth'
import { prisma } from '@/shared/api'

export async function getCurrentUser() {
  const { isAuth, userId } = await verifySession()

  if (!isAuth || !userId) {
    return null
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  })
}