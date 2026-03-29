'use server'

import { cookies } from 'next/headers'

export type AdminLocale = 'en' | 'zh-TW'

export async function setAdminLocale(locale: AdminLocale): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('admin_locale', locale, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  })
}

export async function getAdminLocale(): Promise<AdminLocale> {
  const cookieStore = await cookies()
  const locale = cookieStore.get('admin_locale')?.value
  if (locale === 'en' || locale === 'zh-TW') return locale
  return 'zh-TW'
}
