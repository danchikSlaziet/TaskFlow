'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { useCreateTaskForm } from './useCreateTaskForm'
import type { PriorityType } from '@/entities/task'

interface CreateTaskDialogProps {
  columnId: string
  projectId: string
  trigger?: React.ReactNode
}

export function CreateTaskDialog({ columnId, projectId, trigger }: CreateTaskDialogProps) {
  const { form, isOpen, setIsOpen, serverError, onSubmit, isLoading } = useCreateTaskForm({
    columnId,
    projectId,
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="w-full justify-start gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Plus className="h-3.5 w-3.5" />
            Добавить задачу
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Новая задача</DialogTitle>
            <DialogDescription>
              Создайте задачу и укажите приоритет для команды.
            </DialogDescription>
          </DialogHeader>

          {serverError && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Название <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              placeholder="Например: Разработать дизайн в Figma"
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm font-medium">
              Приоритет
            </label>
            <Select
              defaultValue={form.watch('priority')}
              onValueChange={(val: PriorityType) => form.setValue('priority', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите приоритет" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Низкий</SelectItem>
                <SelectItem value="MEDIUM">Средний</SelectItem>
                <SelectItem value="HIGH">Высокий</SelectItem>
                <SelectItem value="URGENT">Срочно</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Описание <span className="text-xs text-muted-foreground">(необязательно)</span>
            </label>
            <Textarea
              id="description"
              placeholder="Детали и требования к задаче..."
              className="resize-none"
              rows={3}
              {...form.register('description')}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Создание...' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}