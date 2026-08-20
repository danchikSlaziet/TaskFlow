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
import { sendVerificationCodeEmail } from '@/shared/lib/email'

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

    if (existingUser && existingUser.isVerified) {
      return { success: false, error: 'Пользователь с таким email уже существует' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    let user = existingUser

    if (existingUser && !existingUser.isVerified) {
      user = await prisma.user.update({
        where: { email },
        data: {
          name: name || null,
          password: hashedPassword,
        },
      })
    } else {
      user = await prisma.user.create({
        data: {
          name: name || null,
          email,
          password: hashedPassword,
          isVerified: false,
        },
      })
    }


    const code = Math.floor(100000 + Math.random() * 900000).toString()

    await prisma.verificationCode.deleteMany({ where: { email } })
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    })

    const emailRes = await sendVerificationCodeEmail(email, code)
    if (!emailRes.success) {
      return { success: false, error: 'Не удалось отправить письмо с кодом подтверждения' }
    }

    return { success: true, requiresVerification: true, email: user.email }
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

    if (!user.isVerified) {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      await prisma.verificationCode.deleteMany({ where: { email } })
      await prisma.verificationCode.create({
        data: {
          email,
          code,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      })
      const emailRes = await sendVerificationCodeEmail(email, code)
      if (!emailRes.success) {
        return { success: false, error: 'Не удалось отправить письмо с кодом подтверждения' }
      }
      return {
        success: false,
        error: 'Email не подтвержден. Мы отправили новый код на вашу почту.',
        requiresVerification: true,
        email: user.email,
      }
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

export async function verifyCodeAction({ email, code }: { email: string; code: string }) {
  try {
    const record = await prisma.verificationCode.findFirst({
      where: { email, code },
    })

    if (!record) {
      return { success: false, error: 'Неверный код подтверждения' }
    }

    if (record.expiresAt < new Date()) {
      return { success: false, error: 'Срок действия кода истек. Запросите новый.' }
    }

    const user = await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    })

    // удаляем использованные коды для этого email
    await prisma.verificationCode.deleteMany({ where: { email } })

    await createSession(user.id)
    return { success: true }
  } catch (err) {
    console.error('Verify code error:', err)
    return { success: false, error: 'Ошибка сервера. Повторите попытку позже.' }
  }
}

export async function resendCodeAction(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return { success: false, error: 'Пользователь не найден' }
    }

    if (user.isVerified) {
      return { success: false, error: 'Email уже подтвержден' }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()

    await prisma.verificationCode.deleteMany({ where: { email } })
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    })

    const emailRes = await sendVerificationCodeEmail(email, code)
    if (!emailRes.success) {
      return { success: false, error: 'Не удалось отправить письмо с кодом подтверждения' }
    }

    return { success: true }
  } catch (err) {
    console.error('Resend code error:', err)
    return { success: false, error: 'Не удалось отправить код' }
  }
}
