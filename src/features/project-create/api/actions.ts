'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/entities/user/index.server'
import { createProjectSchema, type CreateProjectInput } from '@/entities/project'
import { prisma } from '@/shared/api'
import { ROUTES } from '@/shared/config'

export async function createProjectAction(input: CreateProjectInput) {
  const user = await getCurrentUser()

  if (!user) {
    return { error: 'Пользователь не авторизован' }
  }

  const validatedFields = createProjectSchema.safeParse(input)

  if (!validatedFields.success) {
    return { error: 'Некорректные данные проекта' }
  }

  const { name, description } = validatedFields.data

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        ownerId: user.id,
        // дефолтные колонки проекта
        columns: {
          create: [
            { name: 'Backlog', order: 1000 },
            { name: 'In Progress', order: 2000 },
            { name: 'Done', order: 3000 },
          ],
        },
      },
    })

    revalidatePath(ROUTES.PROJECTS) // Сбрасываем Server Data Cache
    return { success: true, project }
  } catch (error) {
    console.error('Failed to create project:', error)
    return { error: 'Не удалось создать проект' }
  }
}