'use server'

import { cookies } from 'next/headers'
import type { Locale } from '@/i18n/routing'

export async function setAdminLocale(locale: Locale): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('admin_locale', locale, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  })
}

export async function getAdminLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const locale = cookieStore.get('admin_locale')?.value
  if (locale === 'en' || locale === 'zh-TW') return locale
  return 'zh-TW'
}
