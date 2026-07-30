'use client'

import { useState, useTransition, useMemo } from 'react'
import { toast } from 'sonner'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { KanbanColumn, type ColumnData } from './KanbanColumn'
import { TaskCard, type TaskItem, type PriorityType } from '@/entities/task'
import { updateTaskOrderAction } from '@/features/task-drag-and-drop/index.server'

interface KanbanBoardProps {
  projectId: string
  initialColumns: ColumnData[]
}

export function KanbanBoard({ projectId, initialColumns }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<PriorityType | 'ALL'>('ALL')
  const [, startTransition] = useTransition()

  const [columns, setColumns] = useState<ColumnData[]>(initialColumns)

  // настройка сенсоров для пк и мобилки
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50, // 50мс на мобилке перед драгом
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const filteredColumns = useMemo(() => {
    return columns.map((col) => ({
      ...col,
      tasks: col.tasks.filter((task) => {
        const matchesSearch =
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesPriority = selectedPriority === 'ALL' || task.priority === selectedPriority
        return matchesSearch && matchesPriority
      }),
    }))
  }, [columns, searchQuery, selectedPriority])

  const findColumn = (id: string) => {
    const col = columns.find((c) => c.id === id)
    if (col) return col
    return columns.find((c) => c.tasks.some((t) => t.id === id))
  }

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeCol = findColumn(activeId)
    const overCol = findColumn(overId)

    if (!activeCol || !overCol) return

    // если драг происходит ВНУТРИ одной колонки — ничего не делаем
    if (activeCol.id === overCol.id) return

    // если карточка перешла в другую колонку — перекидываем 1 раз:
    const isAlreadyInOverCol = overCol.tasks.some((t) => t.id === activeId)
    if (isAlreadyInOverCol) return

    setColumns((prevCols) => {
      const activeTaskObj = activeCol.tasks.find((t) => t.id === activeId)
      if (!activeTaskObj) return prevCols

      return prevCols.map((col) => {
        if (col.id === activeCol.id) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== activeId) }
        }
        if (col.id === overCol.id) {
          return {
            ...col,
            tasks: [...col.tasks, { ...activeTaskObj, columnId: overCol.id }],
          }
        }
        return col
      })
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeCol = findColumn(activeId)
    const overCol = findColumn(overId)

    if (!activeCol || !overCol) return

    const activeIndex = activeCol.tasks.findIndex((t) => t.id === activeId)
    const overIndex = overCol.tasks.findIndex((t) => t.id === overId)

    let targetTasks = [...overCol.tasks]
    let newIndex = overIndex >= 0 ? overIndex : targetTasks.length - 1

    if (activeCol.id === overCol.id) {
      if (activeIndex !== overIndex && overIndex >= 0) {
        targetTasks = arrayMove(activeCol.tasks, activeIndex, overIndex)
        newIndex = overIndex
      }
    }

    // Вычисляем математический order (среднее между соседями)
    const prevTask = targetTasks[newIndex - 1]
    const nextTask = targetTasks[newIndex + 1]

    let newOrder = 1000
    if (prevTask && nextTask) {
      newOrder = (prevTask.order + nextTask.order) / 2
    } else if (prevTask) {
      newOrder = prevTask.order + 1000
    } else if (nextTask) {
      newOrder = nextTask.order / 2
    }

    // Снимок состояния до изменения 
    const previousColumns = columns

    setColumns((prevCols) =>
      prevCols.map((col) => {
        if (col.id === overCol.id) {
          const tasksCopy = [...targetTasks]
          if (tasksCopy[newIndex]) {
            tasksCopy[newIndex] = { ...tasksCopy[newIndex], order: newOrder }
          }
          return { ...col, tasks: tasksCopy }
        }
        return col
      })
    )

    startTransition(async () => {
      try {
        const res = await updateTaskOrderAction({
          taskId: activeId,
          targetColumnId: overCol.id,
          newOrder,
          projectId,
        })

        if (res?.error) {
          // откат
          setColumns(previousColumns)
          toast.error('Не удалось сохранить', {
            description: res.error || 'Ошибка при обновлении порядка задач',
          })
        }
      } catch (err) {
        // перехват оффлайна/500
        console.error(err)
        setColumns(previousColumns)
        toast.error('Отсутствует подключение к интернету', {
          description: 'Изменения не сохранены. Проверьте соединение с сетью.',
        })
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border bg-card p-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по задачам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-4 w-4 text-muted-foreground mr-1 shrink-0" />
          {(['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
            <Button
              key={p}
              variant={selectedPriority === p ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedPriority(p)}
              className="h-7 text-xs font-medium"
            >
              {p === 'ALL' ? 'Все' : p === 'URGENT' ? 'Срочно' : p === 'HIGH' ? 'Высокий' : p === 'MEDIUM' ? 'Средний' : 'Низкий'}
            </Button>
          ))}
        </div>
      </div>

      <DndContext
        id="kanban-board-dnd"
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto -mx-4 sm:-mx-8 px-4 sm:px-8 pb-6 items-start min-h-[500px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filteredColumns.map((column) => (
            <KanbanColumn key={column.id} column={column} projectId={projectId} />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="rotate-1 scale-[1.02] shadow-2xl rounded-xl overflow-hidden transition-transform">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
