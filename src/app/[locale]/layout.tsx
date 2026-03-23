import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getMessages, getTranslations } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { routing } from '@/i18n/routing'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === 'zh-TW'

  const title = isZh
    ? 'Moso Tea | 威靈頓傳統茶道體驗'
    : 'Moso Tea | Traditional Tea Ceremony Experiences in Wellington'
  const description = isZh
    ? '在 Moso Tea 體驗茶道藝術。在威靈頓私密花園中享受正宗茶道體驗。'
    : 'Experience the art of tea at Moso Tea. Authentic tea ceremony experiences in an intimate Wellington garden setting.'

  return {
    title: {
      default: title,
      template: isZh ? '%s | Moso Tea' : '%s | Moso Tea',
    },
    description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://mosotea.co.nz'),
    openGraph: {
      title,
      description,
      siteName: 'Moso Tea',
      locale: isZh ? 'zh_TW' : 'en_NZ',
      type: 'website',
    },
    alternates: {
      languages: {
        en: '/',
        'zh-TW': '/zh-TW',
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'en' | 'zh-TW')) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
