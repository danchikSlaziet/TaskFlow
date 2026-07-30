'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableTaskCard } from './SortableTaskCard'
import { CreateTaskDialog } from '@/features/task-create'
import type { TaskItem } from '@/entities/task'
import { useMemo } from 'react'

export interface ColumnData {
  id: string
  name: string
  order: number
  tasks: TaskItem[]
}

interface KanbanColumnProps {
  column: ColumnData
  projectId: string
}

export function KanbanColumn({ column, projectId }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  })
  const tasksString = column.tasks.map((t) => t.id).join(',')
  const taskIds = useMemo(() => column.tasks.map((t) => t.id), [tasksString])
  // const taskIds = useMemo(
  //   () => column.tasks.map((t) => t.id),
  //   [column.tasks.map((t) => t.id).join(',')] // мемоизирует сравнивая примитивы, а не тупо ссылки на массивы (одни и те же)
  // )

  return (
    <div
      ref={setNodeRef}
      className="flex min-w-[300px] max-w-[450px] flex-1 flex-col rounded-xl border bg-muted/30 p-3.5"
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm tracking-tight">{column.name}</h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
            {column.tasks.length}
          </span>
        </div>
      </div>

      {/* список задач колонки с сортировкой */}
      <div className="flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden min-h-[150px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>

      <div className="mt-3 pt-2 border-t border-border/50">
        <CreateTaskDialog columnId={column.id} projectId={projectId} />
      </div>
    </div>
  )
}