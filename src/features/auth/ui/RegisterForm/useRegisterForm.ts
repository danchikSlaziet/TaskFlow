import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/entities/user'
import { ROUTES } from '@/shared/config'
import { registerAction } from '../../api/actions'

export function useRegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = form.handleSubmit(async (data: RegisterInput) => {
    setError(null)

    try {
      const response = await registerAction(data)

      if (!response.success) {
        setError(response.error || 'Произошла ошибка при регистрации')
        return
      }

      startTransition(() => {
        router.push(ROUTES.PROJECTS) 
        router.refresh() // чтобы кука точно "вшилась"
      }) 
    } catch {
      setError('Не удалось связаться с сервером')
    }
  })

  return {
    form,
    error,
    isLoading: form.formState.isSubmitting || isPending,
    handleSubmit: onSubmit,
  }
}