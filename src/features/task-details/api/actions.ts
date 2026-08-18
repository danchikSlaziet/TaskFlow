'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/shared/api'
import { getCurrentUser } from '@/entities/user/index.server'
import {
  updateTaskDetailsSchema,
  createSubtaskSchema,
  type UpdateTaskDetailsInput,
  type CreateSubtaskInput,
} from '@/entities/task'

export async function updateTaskDetailsAction(input: UpdateTaskDetailsInput, projectId: string) {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'Необходима авторизация' }
  }

  const validation = updateTaskDetailsSchema.safeParse(input)
  if (!validation.success) {
    return { error: validation.error.errors[0]?.message || 'Неверные данные' }
  }

  const { taskId, title, description, priority, columnId, dueDate } = validation.data

  try {
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description: description || null,
        priority,
        columnId,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        subtasks: true,
      },
    })

    revalidatePath(`/projects/${projectId}`)
    return { success: true, task: updatedTask }
  } catch (err) {
    console.error(err)
    return { error: 'Не удалось обновить задачу' }
  }
}

export async function deleteTaskAction(taskId: string, projectId: string) {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'Необходима авторизация' }
  }

  try {
    await prisma.task.delete({
      where: { id: taskId },
    })

    revalidatePath(`/projects/${projectId}`)
    return { success: true }
  } catch (err) {
    console.error(err)
    return { error: 'Не удалось удалить задачу' }
  }
}

export async function createSubtaskAction(input: CreateSubtaskInput, projectId: string) {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'Необходима авторизация' }
  }

  const validation = createSubtaskSchema.safeParse(input)
  if (!validation.success) {
    return { error: validation.error.errors[0]?.message || 'Неверные данные' }
  }

  try {
    const subtask = await prisma.subtask.create({
      data: {
        taskId: validation.data.taskId,
        title: validation.data.title,
        completed: false,
      },
    })

    revalidatePath(`/projects/${projectId}`)
    return { success: true, subtask }
  } catch (err) {
    console.error(err)
    return { error: 'Не удалось создать подзадачу' }
  }
}

export async function toggleSubtaskAction(subtaskId: string, completed: boolean, projectId: string) {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'Необходима авторизация' }
  }

  try {
    const subtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data: { completed },
    })

    revalidatePath(`/projects/${projectId}`)
    return { success: true, subtask }
  } catch (err) {
    console.error(err)
    return { error: 'Не удалось обновить подзадачу' }
  }
}

export async function deleteSubtaskAction(subtaskId: string, projectId: string) {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'Необходима авторизация' }
  }

  try {
    await prisma.subtask.delete({
      where: { id: subtaskId },
    })

    revalidatePath(`/projects/${projectId}`)
    return { success: true }
  } catch (err) {
    console.error(err)
    return { error: 'Не удалось удалить подзадачу' }
  }
}