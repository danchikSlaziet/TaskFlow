import { z } from 'zod'

export const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
export type PriorityType = z.infer<typeof priorityEnum>

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Название задачи не может быть пустым'),
  description: z.any().optional(), // JSONContent (ProseMirror doc)
  priority: priorityEnum,
  columnId: z.string().min(1, 'Укажите колонку'),
})

export const updateTaskDetailsSchema = z.object({
  taskId: z.string().min(1, 'ID задачи обязателен'),
  title: z.string().min(1, 'Название задачи не может быть пустым'),
  description: z.any().optional(), // JSONContent (ProseMirror doc)
  priority: priorityEnum,
  columnId: z.string().min(1, 'Укажите колонку'),
  dueDate: z.string().nullable().optional(),
})

export type UpdateTaskDetailsInput = z.infer<typeof updateTaskDetailsSchema>

export const createSubtaskSchema = z.object({
  taskId: z.string().min(1, 'ID задачи обязателен'),
  title: z.string().min(1, 'Название подзадачи не может быть пустым'),
})

export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>
export type CreateTaskInput = z.infer<typeof createTaskSchema>