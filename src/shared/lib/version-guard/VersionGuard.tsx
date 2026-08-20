'use client'

import { useEffect, useRef } from 'react'

export function VersionGuard() {
  const initialEtagRef = useRef<string | null>(null)

  useEffect(() => {
    const checkVersionOnFocus = async () => {
      if (document.visibilityState !== 'visible') return

      try {
        // HEAD запрос на текущий роут
        const response = await fetch(window.location.pathname, {
          method: 'HEAD',
          cache: 'no-store',
        })

        const etag = response.headers.get('ETag') || response.headers.get('x-deployment-id')
        if (!etag) return

        if (!initialEtagRef.current) {
          // запоминаем ETag при старте
          initialEtagRef.current = etag
        } else if (initialEtagRef.current !== etag) {
          // ETag на серваке изменился — обновляем страницу
          window.location.reload()
        }
      } catch(e) {
        console.log(e)
      }
    }

    checkVersionOnFocus()
    document.addEventListener('visibilitychange', checkVersionOnFocus)

    // страховка, если деплой прошел прямо в момент активной работы
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const digest = typeof reason?.digest === 'string' ? reason.digest : ''
      const message = typeof reason?.message === 'string' ? reason.message : ''
      const isDeploymentMismatch =
        digest.startsWith('NEXT_ACTION_') ||
        digest.includes('ACTION_NOT_FOUND') ||
        message.includes('Failed to find Server Action') ||
        message.includes('older or newer deployment')
      if (isDeploymentMismatch) {
        event.preventDefault()
        window.location.reload()
      }
    }

    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      document.removeEventListener('visibilitychange', checkVersionOnFocus)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  return null
}