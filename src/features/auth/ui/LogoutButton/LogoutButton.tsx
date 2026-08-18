'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { logoutAction } from '../../api/actions'
import { Button } from '@/shared/ui/button'
import { ROUTES } from '@/shared/config'

export function LogoutButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logoutAction()
        router.push(ROUTES.LOGIN)
        router.refresh()
      } catch (error) {
        console.error('Logout failed:', error)
      }
    })
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={isPending}
    >
      {isPending ? 'Выход...' : 'Выйти из аккаунта'}
    </Button>
  )
}