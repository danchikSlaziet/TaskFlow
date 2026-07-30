'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/entities/user/index.server'
import { createTaskSchema, type CreateTaskInput } from '@/entities/task'
import { prisma } from '@/shared/api'

export async function createTaskAction(input: CreateTaskInput, projectId: string) {
  const user = await getCurrentUser()

  if (!user) {
    return { error: 'Пользователь не авторизован' }
  }

  const validatedFields = createTaskSchema.safeParse(input)

  if (!validatedFields.success) {
    return { error: 'Некорректные данные задачи' }
  }

  const { title, description, priority, columnId } = validatedFields.data

  try {
    // Находим последнюю задачу в колонке, чтобы вычислить order (+1000)
    const lastTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const newOrder = lastTask ? lastTask.order + 1000 : 1000

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority,
        columnId,
        order: newOrder,
      },
    })

    revalidatePath(`/projects/${projectId}`)
    return { success: true, task }
  } catch (error) {
    console.error('Failed to create task:', error)
    return { error: 'Не удалось создать задачу' }
  }
}