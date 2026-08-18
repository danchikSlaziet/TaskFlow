export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROJECTS: '/projects',
  DASHBOARD: '/dashboard',
  BLOG: '/blog',
} as const

export const PROTECTED_ROUTES = [ROUTES.PROJECTS, ROUTES.DASHBOARD]
export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER]