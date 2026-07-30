import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTaskSchema, type CreateTaskInput } from '@/entities/task'
import { createTaskAction } from '../../api/actions'

interface UseCreateTaskFormProps {
  columnId: string
  projectId: string
  onSuccess?: () => void
}

export function useCreateTaskForm({ columnId, projectId, onSuccess }: UseCreateTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      columnId,
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    setServerError(null)

    startTransition(async () => {
      const result = await createTaskAction(data, projectId)

      if (result.error) {
        setServerError(result.error)
        return
      }

      form.reset({ title: '', description: '', priority: 'MEDIUM', columnId })
      setIsOpen(false)
      onSuccess?.()
    })
  })

  return {
    form,
    isOpen,
    setIsOpen,
    serverError,
    onSubmit,
    isLoading: form.formState.isSubmitting || isPending,
  }
}