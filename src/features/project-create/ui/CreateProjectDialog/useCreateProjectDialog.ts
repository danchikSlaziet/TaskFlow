import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProjectSchema, type CreateProjectInput } from '@/entities/project'
import { createProjectAction } from '../../api/actions'

interface UseCreateProjectFormProps {
  onSuccess?: () => void
}

export function useCreateProjectForm({ onSuccess }: UseCreateProjectFormProps = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    setServerError(null)
    const result = await createProjectAction(data)

    if (result.error) {
      setServerError(result.error)
      return
    }

    form.reset()
    setIsOpen(false)
    onSuccess?.()
  })

  return {
    form,
    isOpen,
    setIsOpen,
    serverError,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
  }
}