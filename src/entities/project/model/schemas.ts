import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Название проекта должно содержать от 2 символов'),
  description: z.string().optional().or(z.literal('')),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>