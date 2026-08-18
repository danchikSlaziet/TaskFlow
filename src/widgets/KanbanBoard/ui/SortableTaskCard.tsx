'use client'

import { AnimateLayoutChanges, defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TaskCard, type TaskItem } from '@/entities/task'
import { useMemo } from 'react'

interface SortableTaskCardProps {
  task: TaskItem
  onTaskClick?: (task: TaskItem) => void
}

const customAnimateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true })

export function SortableTaskCard({ task, onTaskClick }: SortableTaskCardProps) {
  const sortableData = useMemo(() => ({ type: 'Task', task }), [task])

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: sortableData,
    animateLayoutChanges: customAnimateLayoutChanges,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
        onClick={() => onTaskClick?.(task)}
      />
    </div>
  )
}