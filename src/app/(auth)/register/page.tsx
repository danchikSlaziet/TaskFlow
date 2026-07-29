import { RegisterForm } from '@/features/auth'
import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'Регистрация | TaskFlow',
  description: 'Создайте аккаунт в TaskFlow',
}

export default function RegisterPage() {
  return <RegisterForm />
}