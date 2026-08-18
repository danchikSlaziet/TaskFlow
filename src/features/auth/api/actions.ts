'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '@/shared/api'
import { createSession, deleteSession } from '@/shared/lib/auth'
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '@/entities/user'

export async function registerAction(data: RegisterInput) {
  try {
    const result = registerSchema.safeParse(data)

    if (!result.success) {
      return { success: false, error: 'Некорректные данные формы' }
    }

    const { name, email, password } = result.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: false, error: 'Пользователь с таким email уже существует' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
      },
    })

    await createSession(user.id)

    return { success: true }
  }
  catch (err) {
    console.error('Register error:', err)
    return { success: false, error: 'Ошибка сервера. Повторите попытку позже.' }
  }
}

export async function loginAction(data: LoginInput) {
  try {
    const result = loginSchema.safeParse(data)

    if (!result.success) {
      return { success: false, error: 'Некорректные данные формы' }
    }

    const { email, password } = result.data

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { success: false, error: 'Неверный email или пароль' }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return { success: false, error: 'Неверный email или пароль' }
    }

    await createSession(user.id)

    return { success: true }
  }
  catch (err) {
    console.error('Login error:', err)
    return { success: false, error: 'Ошибка сервера. Повторите попытку позже.' }
  }
}

export async function logoutAction() {
  try {
    await deleteSession()
    return { success: true }
  }
  catch (err) {
    console.error('Logout error:', err)
    return { success: false, error: 'Ошибка сервера. Повторите попытку позже.' }
  }
}