import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/entities/user'
import { ROUTES } from '@/shared/config'
import { loginAction } from '../../api/actions'

export function useLoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = form.handleSubmit(async (data: LoginInput) => {
    setError(null)

    try {
      const response = await loginAction(data)

      if (!response.success) {
        setError(response.error || 'Произошла ошибка при входе')
        return
      }

      startTransition(() => { // для isPending true до тех пор пока не откроется projects
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