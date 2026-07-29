import { LoginForm } from '@/features/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Вход | TaskFlow',
  description: 'Войдите в аккаунт TaskFlow',
}

export default function LoginPage() {
  return <LoginForm />
}
