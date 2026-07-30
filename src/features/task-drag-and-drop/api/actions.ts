'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/entities/user/index.server'
import { prisma } from '@/shared/api'

interface UpdateTaskOrderInput {
  taskId: string
  targetColumnId: string
  newOrder: number
  projectId: string
}

export async function updateTaskOrderAction({
  taskId,
  targetColumnId,
  newOrder,
  projectId,
}: UpdateTaskOrderInput) {
  const user = await getCurrentUser()

  if (!user) {
    return { error: 'Пользователь не авторизован' }
  }

  try {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        columnId: targetColumnId,
        order: newOrder,
      },
    })

    revalidatePath(`/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update task order:', error)
    return { error: 'Не удалось обновить порядок задачи' }
  }
}