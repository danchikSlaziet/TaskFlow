import { Card, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { GripVertical } from 'lucide-react'
import type { PriorityType } from '../../model/schemas'

export interface TaskItem {
  id: string
  title: string
  description?: string | null
  priority: PriorityType
  order: number
  columnId: string
}

interface TaskCardProps {
  task: TaskItem
  isDragging?: boolean
  dragHandleProps?: Record<string, unknown>
}

// Конфиг цветовых баджей для приоритетов задач
const priorityConfig: Record<PriorityType, { label: string; className: string }> = {
  LOW: { label: 'Низкий', className: 'bg-slate-500/15 text-slate-600 dark:text-slate-400' },
  MEDIUM: { label: 'Средний', className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  HIGH: { label: 'Высокий', className: 'bg-orange-500/15 text-orange-600 dark:text-orange-400' },
  URGENT: { label: 'Срочно', className: 'bg-red-500/15 text-red-600 dark:text-red-400 font-semibold' },
}

export function TaskCard({ task, isDragging, dragHandleProps }: TaskCardProps) {
  const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM

  return (
    <Card
      className={`group relative bg-card border rounded-xl overflow-hidden ${isDragging
        ? 'opacity-20 border-dashed border-primary/40 bg-muted/20 shadow-none'
        : 'hover:border-foreground/20 hover:shadow-sm'
        }`}
    >
      <CardHeader className="p-3.5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-snug line-clamp-2">
            {task.title}
          </CardTitle>

          {/* иконка ручки перетаскивания */}
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground opacity-70 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity p-0.5"
            title="Перетащить карточку"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        </div>

        {task.description && (
          <CardDescription className="text-xs line-clamp-2">
            {task.description}
          </CardDescription>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] ${priority.className}`}>
            {priority.label}
          </span>
        </div>
      </CardHeader>
    </Card>
  )
}