import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { verifyCodeAction, resendCodeAction } from '../../api/actions'
import { ROUTES } from '@/shared/config'

interface UseVerifyCodeProps {
  email: string
  isOpen: boolean
  onClose: () => void
}

export function useVerifyCode({ email, isOpen, onClose }: UseVerifyCodeProps) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [timer, setTimer] = useState(60)
  const [isPending, startTransition] = useTransition()
  const [isResending, setIsResending] = useState(false)

  const handleClose = () => {
    setCode('')
    setError(null)
    setTimer(60)
    onClose()
  }

  useEffect(() => {
    if (!isOpen) return

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen])

  // только цифры, макс. 6
  const handleCodeChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 6)
    setCode(cleanValue)
    if (error) setError(null)
  }

  const handleVerify = () => {
    if (code.length !== 6 || isPending) return

    startTransition(async () => {
      const res = await verifyCodeAction({ email, code })

      if (res.success) {
        toast.success('Email успешно подтвержден!')
        onClose()
        router.push(ROUTES.PROJECTS)
        router.refresh()
      } else {
        setError(res.error || 'Неверный код')
      }
    })
  }

  // повторный код
  const handleResend = async () => {
    if (timer > 0 || isResending) return

    setIsResending(true)
    setError(null)

    const res = await resendCodeAction(email)

    setIsResending(false)

    if (res.success) {
      toast.success('Новый код отправлен на вашу почту')
      setTimer(60)
    } else {
      setError(res.error || 'Не удалось отправить код')
    }
  }

  return {
    code,
    timer,
    error,
    isPending,
    isResending,
    handleClose,
    handleCodeChange,
    handleVerify,
    handleResend,
  }
}