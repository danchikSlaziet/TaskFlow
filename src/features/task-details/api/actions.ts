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
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

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

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'application/pdf',
]
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function uploadFileAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'Необходима авторизация' }
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return { error: 'Файл не выбран' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: 'Максимальный размер файла — 10 МБ' }
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { error: 'Разрешены только изображения (JPG, PNG, WEBP) и PDF файлы' }
  }

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const extension = file.type === 'application/pdf' ? 'pdf' : file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1]
    const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, safeFileName)
    await writeFile(filePath, buffer)

    return {
      success: true,
      url: `/uploads/${safeFileName}`,
      name: file.name,
      type: file.type,
      size: (file.size / (1024 * 1024)).toFixed(2), // размер в мб
    }
  } catch (err) {
    console.error('Ошибка сохранения файла:', err)
    return { error: 'Ошибка сохранения файла на сервере' }
  }
}
