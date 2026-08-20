import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/entities/user'
import { registerAction } from '../../api/actions'

export function useRegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false)
  const [verifyEmail, setVerifyEmail] = useState('')

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = form.handleSubmit((data: RegisterInput) => {
    setError(null)

    startTransition(async () => {
      try {
        const response = await registerAction(data)
        if (response.requiresVerification && response.email) {
          setVerifyEmail(response.email)
          setIsVerifyModalOpen(true)
          return
        }
        if (!response.success) {
          setError(response.error || 'Произошла ошибка при регистрации')
          return
        }
      } catch {
        setError('Не удалось связаться с сервером')
      }
    })
  })

  return {
    form,
    error,
    isLoading: form.formState.isSubmitting || isPending,
    handleSubmit: onSubmit,
    isVerifyModalOpen,
    verifyEmail,
    closeVerifyModal: () => setIsVerifyModalOpen(false)
  }
}