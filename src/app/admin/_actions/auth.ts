'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

interface AuthState {
  error?: string
}

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = formData.get('password') as string

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return { error: 'errorWrongPassword' }
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_token', process.env.ADMIN_SECRET_TOKEN!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  redirect('/admin')
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('admin_token')
  redirect('/admin/login')
}
