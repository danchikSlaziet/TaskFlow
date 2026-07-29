import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/entities/user'
import { loginAction } from '../../api/actions'

export function useLoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await loginAction(data)

      setIsLoading(false)

      if (!response.success) {
        setError(response.error || 'Произошла ошибка при входе')
        return
      }

      router.push('/projects')
      router.refresh() // чтобы кука точно "вшилась"
    }
    catch (err) {
      setError('Не удалось связаться с сервером')
    }
    finally {
      setIsLoading(false)
    }
  }

  return {
    form,
    error,
    isLoading,
    handleSubmit: form.handleSubmit(onSubmit),
  }
}