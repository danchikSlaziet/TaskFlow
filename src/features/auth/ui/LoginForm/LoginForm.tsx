'use client'

import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { useLoginForm } from './useLoginForm'
import { Kanban } from 'lucide-react'
import { VerifyCodeModal } from '../VerifyCodeModal/VerifyCodeModal'

export function LoginForm() {
  const { form, error, isLoading, handleSubmit, verifyEmail, isVerifyModalOpen, closeVerifyModal } = useLoginForm()
  const { register, formState: { errors } } = form

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg">
          <Kanban className="h-6 w-6" />
        </div>
      </div>
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Вход в TaskFlow</CardTitle>
          <CardDescription>
            Введите ваш email и&nbsp;пароль для входа в&nbsp;аккаунт
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm mb-2 block font-medium leading-none" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm mb-2 block font-medium leading-none" htmlFor="password">
                Пароль
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 bg-transparent border-none">
            <Button type="submit" className="w-full font-semibold transition-all active:scale-[0.98]" disabled={isLoading}>
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Ещё нет аккаунта?{' '}
              <Link href="/register" className="font-semibold underline hover:text-primary">
                Зарегистрироваться
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      <VerifyCodeModal email={verifyEmail} isOpen={isVerifyModalOpen} onClose={closeVerifyModal} />
    </div>
  )
}