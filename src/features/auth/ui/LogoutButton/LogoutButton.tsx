'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { logoutAction } from '../../api/actions'
import { Button } from '@/shared/ui/button'
import { ROUTES } from '@/shared/config'

export function LogoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logoutAction()
      router.push(ROUTES.LOGIN)
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? 'Выход...' : 'Выйти из аккаунта'}
    </Button>
  )
}