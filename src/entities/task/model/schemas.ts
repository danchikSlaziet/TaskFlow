import { z } from 'zod'

export const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
export type PriorityType = z.infer<typeof priorityEnum>

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Название задачи не может быть пустым'),
  description: z.string().optional().or(z.literal('')),
  priority: priorityEnum,
  columnId: z.string().min(1, 'Укажите колонку'),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>