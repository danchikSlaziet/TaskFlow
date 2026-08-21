'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui/sheet'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Calendar } from '@/shared/ui/calendar'
import { ru } from 'date-fns/locale'
import type { JSONContent } from '@tiptap/react'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/shared/ui/skeleton'

import {
  Calendar as CalendarIcon,
  Trash2,
  Plus,
  CheckCircle2,
  Circle,
  Loader2,
  AlignLeft,
  CheckSquare,
  Columns3,
  Flame,
  AlertCircle,
  Clock,
  Check,
  X,
} from 'lucide-react'
import type { TaskItem, SubtaskItem, PriorityType } from '@/entities/task'
import {
  updateTaskDetailsAction,
  deleteTaskAction,
  createSubtaskAction,
  toggleSubtaskAction,
  deleteSubtaskAction,
  uploadFileAction,
} from '../api/actions'
import { useDebounce } from '@/shared/lib/useDebounce'

const TiptapEditor = dynamic(
  () => import('@/shared/ui/tiptap-editor').then((m) => m.TiptapEditor),
  {
    ssr: false,
    loading: () => <Skeleton className="min-h-[160px] w-full rounded-xl" />,
  }
)

interface TaskDetailsSheetProps {
  task: TaskItem | null
  columns: { id: string; name: string }[]
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const priorityConfig: Record<
  PriorityType,
  { label: string; icon: typeof Flame; colorClass: string; badgeClass: string }
> = {
  URGENT: {
    label: 'Срочно',
    icon: Flame,
    colorClass: 'text-rose-500',
    badgeClass: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  },
  HIGH: {
    label: 'Высокий',
    icon: AlertCircle,
    colorClass: 'text-amber-500',
    badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  MEDIUM: {
    label: 'Средний',
    icon: Clock,
    colorClass: 'text-blue-500',
    badgeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  LOW: {
    label: 'Низкий',
    icon: Check,
    colorClass: 'text-zinc-500 dark:text-zinc-400',
    badgeClass: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
  },
}

export function TaskDetailsSheet({
  task,
  columns,
  projectId,
  open,
  onOpenChange,
}: TaskDetailsSheetProps) {
  const [isPending, startTransition] = useTransition()
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [localTask, setLocalTask] = useState<TaskItem | null>(task)

  const debouncedTitle = useDebounce(localTask?.title ?? '', 500)
  const debouncedDescription = useDebounce(
    localTask?.description
      ? (typeof localTask.description === 'string'
        ? localTask.description
        : JSON.stringify(localTask.description))
      : '',
    500
  )
  const isMountedRef = useRef(false)

  // Дебаунс для автосохранения текстовых полей
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true
      return
    }
    if (!localTask) return

    startTransition(async () => {
      try {
        const res = await updateTaskDetailsAction(
          {
            taskId: localTask.id,
            title: debouncedTitle,
            description: debouncedDescription || null,
            priority: localTask.priority,
            columnId: localTask.columnId,
            dueDate: localTask.dueDate ? new Date(localTask.dueDate).toISOString() : null,
          },
          projectId
        )
        if (res?.error) toast.error(res.error)
      } catch (err) {
        console.error(err)
        toast.error('Отсутствует подключение к интернету')
      }
    })
  }, [debouncedTitle, debouncedDescription])

  if (!localTask) return null

  // Текстовые поля (title, description)
  const handleTextUpdate = (updates: Partial<Pick<TaskItem, 'title' | 'description'>>) => {
    setLocalTask((prev) => (prev ? { ...prev, ...updates } : null))
  }

  // Мгновенные поля (колонка, приоритет, дата)
  const handleImmediateUpdate = (updates: Partial<TaskItem>) => {
    const previousTask = localTask
    setLocalTask((prev) => (prev ? { ...prev, ...updates } : null))

    startTransition(async () => {
      try {
        const updated = { ...localTask!, ...updates }
        const res = await updateTaskDetailsAction(
          {
            taskId: updated.id,
            title: updated.title,
            description: updated.description
              ? (typeof updated.description === 'string'
                ? updated.description
                : JSON.stringify(updated.description))
              : null,
            priority: updated.priority,
            columnId: updated.columnId,
            dueDate: updated.dueDate ? new Date(updated.dueDate).toISOString() : null,
          },
          projectId
        )
        if (res?.error) {
          setLocalTask(previousTask)
          toast.error(res.error)
        }
      } catch (err) {
        setLocalTask(previousTask)
        toast.error('Отсутствует подключение к интернету')
      }
    })
  }

  // Переключение подзадачи
  const handleToggleSubtask = (subtask: SubtaskItem) => {
    const previousTask = localTask
    const nextCompleted = !subtask.completed
    const updatedSubtasks = localTask.subtasks?.map((s) =>
      s.id === subtask.id ? { ...s, completed: nextCompleted } : s
    )
    setLocalTask({ ...localTask, subtasks: updatedSubtasks })

    startTransition(async () => {
      try {
        const res = await toggleSubtaskAction(subtask.id, nextCompleted, projectId)
        if (res?.error) {
          setLocalTask(previousTask)
          toast.error(res.error)
        }
      } catch (err) {
        console.error(err)
        setLocalTask(previousTask)
        toast.error('Отсутствует подключение к интернету')
      }
    })
  }

  // Добавление подзадачи
  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return
    const title = newSubtaskTitle.trim()
    setNewSubtaskTitle('')

    startTransition(async () => {
      try {
        const res = await createSubtaskAction({ taskId: localTask.id, title }, projectId)
        if (res?.error) {
          toast.error(res.error)
        } else if (res?.subtask) {
          setLocalTask({
            ...localTask,
            subtasks: [...(localTask.subtasks || []), res.subtask],
          })
        }
      } catch (err) {
        console.error(err)
        toast.error('Отсутствует подключение к интернету')
      }
    })
  }

  // Удаление подзадачи
  const handleDeleteSubtask = (subtaskId: string) => {
    const previousTask = localTask
    setLocalTask({
      ...localTask,
      subtasks: localTask.subtasks?.filter((s) => s.id !== subtaskId),
    })

    startTransition(async () => {
      try {
        const res = await deleteSubtaskAction(subtaskId, projectId)
        if (res?.error) {
          setLocalTask(previousTask)
          toast.error(res.error)
        }
      } catch (err) {
        console.error(err)
        setLocalTask(previousTask)
        toast.error('Отсутствует подключение к интернету')
      }
    })
  }

  // Удаление всей задачи
  const handleDeleteTask = () => {
    onOpenChange(false)

    startTransition(async () => {
      try {
        const res = await deleteTaskAction(localTask.id, projectId)
        if (res?.success) {
          toast.success('Задача удалена')
        } else {
          toast.error(res?.error || 'Не удалось удалить задачу')
        }
      } catch (err) {
        console.error(err)
        toast.error('Отсутствует подключение к интернету')
      }
    })
  }

  const subtasks = localTask.subtasks || []
  const completedCount = subtasks.filter((s) => s.completed).length
  const totalCount = subtasks.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="!w-full sm:!max-w-xl p-0 flex flex-col justify-between overflow-hidden bg-background border-l shadow-2xl"
        aria-describedby={undefined}
      >
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          <SheetHeader className="space-y-2 text-left">
            <SheetTitle className="sr-only">Редактирование задачи</SheetTitle>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono text-muted-foreground uppercase tracking-wider">
              <span>Задача</span>
              <span>•</span>
              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                {columns.find((c) => c.id === localTask.columnId)?.name || 'Колонка'}
              </span>
            </div>

            <Textarea
              value={localTask.title}
              onChange={(e) => handleTextUpdate({ title: e.target.value })}
              placeholder="Название задачи..."
              rows={2}
              className="text-lg sm:text-xl font-bold tracking-tight border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/30 p-2 -ml-2 rounded-lg resize-none min-h-[58px] bg-transparent hover:bg-muted/30 focus-visible:bg-muted/40 text-foreground placeholder:text-muted-foreground/40 leading-snug transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  e.currentTarget.blur()
                }
              }}
            />
          </SheetHeader>

          {/* Properties: На мобилке компактные чипы в ряд, на десктопе — таблица */}
          <div className="rounded-xl border bg-card/60 p-3 sm:p-4 shadow-xs">
            {/* Мобильный вид (компактные кнопки-чипы в ряд) */}
            <div className="flex flex-wrap items-center gap-2 sm:hidden">
              {/* Колонка */}
              <Select
                value={localTask.columnId}
                onValueChange={(columnId) => handleImmediateUpdate({ columnId })}
              >
                <SelectTrigger className="h-8 w-auto gap-1.5 px-2.5 text-xs font-medium bg-background/80 rounded-lg">
                  <Columns3 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Колонка" />
                </SelectTrigger>
                <SelectContent align="start">
                  {columns.map((col) => (
                    <SelectItem key={col.id} value={col.id} className="text-xs">
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Приоритет */}
              <Select
                value={localTask.priority}
                onValueChange={(priority) =>
                  handleImmediateUpdate({ priority: priority as PriorityType })
                }
              >
                <SelectTrigger className="h-8 w-auto gap-1.5 px-2.5 text-xs font-medium bg-background/80 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  {(Object.keys(priorityConfig) as PriorityType[]).map((p) => {
                    const cfg = priorityConfig[p]
                    const Icon = cfg.icon
                    return (
                      <SelectItem key={p} value={p} className="text-xs">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-3.5 w-3.5 ${cfg.colorClass}`} />
                          <span>{cfg.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>

              {/* Срок */}
              <div className="relative flex items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-8 gap-1.5 px-2.5 text-xs font-medium bg-background/80 rounded-lg ${localTask.dueDate ? 'pr-7' : ''
                        }`}
                    >
                      <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>
                        {localTask.dueDate ? (
                          new Date(localTask.dueDate).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                          })
                        ) : (
                          'Срок'
                        )}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      locale={ru}
                      mode="single"
                      selected={localTask.dueDate ? new Date(localTask.dueDate) : undefined}
                      onSelect={(date) =>
                        handleImmediateUpdate({ dueDate: date ? date.toISOString() : null })
                      }
                    />
                  </PopoverContent>
                </Popover>

                {localTask.dueDate && (
                  <button
                    type="button"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors active:scale-95"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleImmediateUpdate({ dueDate: null })
                    }}
                    title="Очистить дату"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Десктопный вид (аккуратная сетка с метками) */}
            <div className="hidden sm:space-y-3 sm:block">
              {/* Колонка */}
              <div className="grid grid-cols-[1fr_180px] items-center gap-3 text-xs">
                <span className="text-muted-foreground flex items-center gap-2 font-medium truncate">
                  <Columns3 className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" /> Колонка
                </span>
                <Select
                  value={localTask.columnId}
                  onValueChange={(columnId) => handleImmediateUpdate({ columnId })}
                >
                  <SelectTrigger className="h-8 w-full text-xs font-medium bg-background/80">
                    <SelectValue placeholder="Колонка" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {columns.map((col) => (
                      <SelectItem key={col.id} value={col.id} className="text-xs">
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Приоритет */}
              <div className="grid grid-cols-[1fr_180px] items-center gap-3 text-xs pt-3 border-t border-border/40">
                <span className="text-muted-foreground flex items-center gap-2 font-medium truncate">
                  <Flame className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" /> Приоритет
                </span>
                <Select
                  value={localTask.priority}
                  onValueChange={(priority) =>
                    handleImmediateUpdate({ priority: priority as PriorityType })
                  }
                >
                  <SelectTrigger className="h-8 w-full text-xs font-medium bg-background/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {(Object.keys(priorityConfig) as PriorityType[]).map((p) => {
                      const cfg = priorityConfig[p]
                      const Icon = cfg.icon
                      return (
                        <SelectItem key={p} value={p} className="text-xs">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-3.5 w-3.5 ${cfg.colorClass}`} />
                            <span>{cfg.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Срок выполнения */}
              <div className="grid grid-cols-[1fr_180px] items-center gap-3 text-xs pt-3 border-t border-border/40">
                <span className="text-muted-foreground flex items-center gap-2 font-medium truncate">
                  <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" /> Срок
                </span>

                <div className="relative flex items-center w-full">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-8 w-full justify-start text-xs font-medium bg-background/80 text-left ${localTask.dueDate ? 'pr-7' : ''
                          }`}
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-70 shrink-0" />
                        <span className="truncate">
                          {localTask.dueDate ? (
                            new Date(localTask.dueDate).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          ) : (
                            <span className="text-muted-foreground">Без срока</span>
                          )}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        locale={ru}
                        mode="single"
                        selected={localTask.dueDate ? new Date(localTask.dueDate) : undefined}
                        onSelect={(date) =>
                          handleImmediateUpdate({ dueDate: date ? date.toISOString() : null })
                        }
                      />
                    </PopoverContent>
                  </Popover>

                  {localTask.dueDate && (
                    <button
                      type="button"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors active:scale-95"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleImmediateUpdate({ dueDate: null })
                      }}
                      title="Очистить дату"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <AlignLeft className="h-3.5 w-3.5" /> Описание
            </label>
            <TiptapEditor
              onUpload={uploadFileAction}
              value={localTask.description as JSONContent | null}
              onChange={(json) => handleTextUpdate({ description: json })}
              placeholder="Добавьте подробности, заметки или требования..."
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <CheckSquare className="h-3.5 w-3.5" /> Чеклист
              </label>
              {totalCount > 0 && (
                <span className="text-xs text-muted-foreground font-mono">
                  {completedCount} из {totalCount} ({progressPercent}%)
                </span>
              )}
            </div>

            {totalCount > 0 && (
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}

            <div className="space-y-1.5">
              {subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="group flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg border bg-card/50 hover:bg-card hover:border-primary/20 transition-all text-sm"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(subtask)}
                    className="flex items-center gap-2.5 flex-1 text-left min-w-0"
                  >
                    {subtask.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 transition-colors" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/60 hover:text-primary shrink-0 transition-colors" />
                    )}
                    <span
                      className={`truncate text-xs sm:text-sm transition-all ${subtask.completed
                        ? 'line-through text-muted-foreground/60'
                        : 'text-foreground'
                        }`}
                    >
                      {subtask.title}
                    </span>
                  </button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add Subtask Form */}

            <form onSubmit={handleAddSubtask} className="flex gap-2 pt-1">
              <Input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Добавить подзадачу"
                className="h-9 sm:h-8 text-xs bg-card/40 border-muted-foreground/20 rounded-lg"
              />
              <Button type="submit" size="sm" className="h-9 sm:h-8 text-xs px-3 rounded-lg shrink-0">
                <Plus className="h-3.5 w-3.5 mr-1" /> Добавить
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t bg-muted/20 px-4 py-3 sm:px-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteTask}
            disabled={isPending}
            className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            )}
            Удалить задачу
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8"
          >
            Закрыть
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}