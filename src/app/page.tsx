import { redirect } from 'next/navigation'
import { verifySession } from '@/shared/lib/auth'

export default async function HomePage() {
  const { isAuth } = await verifySession()

  if (isAuth) {
    redirect('/projects')
  } else {
    redirect('/login')
  }
}
