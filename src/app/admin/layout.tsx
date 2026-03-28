import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getAdminLocale } from './_actions/locale'

export const metadata: Metadata = {
  title: 'Moso Tea Admin',
}

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getAdminLocale()
  const messages = (await import(`../../../messages/${locale}.json`)).default

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
