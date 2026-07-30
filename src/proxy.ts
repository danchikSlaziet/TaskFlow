import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { ROUTES, PROTECTED_ROUTES, AUTH_ROUTES } from '@/shared/config'

const secretKey = process.env.JWT_SECRET || 'fallback-secret-key-change-it-in-env'
const encodedKey = new TextEncoder().encode(secretKey)

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => path.startsWith(route)) // будут вложенные страницы => /projects/cuid123
  const isAuthRoute = AUTH_ROUTES.some((route) => route === path)

  const cookie = request.cookies.get('session')?.value
  let isAuthenticated = false

  if (cookie) {
    try {
      await jwtVerify(cookie, encodedKey, { algorithms: ['HS256'] })
      isAuthenticated = true
    } catch {
      isAuthenticated = false
    }
  }

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.nextUrl))
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(ROUTES.PROJECTS, request.nextUrl))
  }
  // для всех остальных пропускаем дальше
  return NextResponse.next()
}

export const config = {
  // исключаем картинки, статические файлы и тд из обработки middleware (проверка кук только при загрузке страниц)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}