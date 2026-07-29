import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/entities/user'
import { registerAction } from '../../api/actions'

export function useRegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await registerAction(data)
      setIsLoading(false)

      if (!response.success) {
        setError(response.error || 'Произошла ошибка при регистрации')
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