import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getMessages } from 'next-intl/server'
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
    : 'Moso Tea — Tea Ceremony & Workshop Experiences in Wellington NZ'
  const description = isZh
    ? '在 Moso Tea 體驗茶道藝術。在威靈頓私密花園中享受正宗茶道體驗。'
    : 'Moso Tea offers authentic tea ceremony workshops and hands-on tea making experiences in Wellington, New Zealand. Book your intimate garden tea session today.'

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mosotea.co.nz'

  return {
    title: {
      default: title,
      template: '%s | Moso Tea',
    },
    description,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title,
      description,
      siteName: 'Moso Tea',
      locale: isZh ? 'zh_TW' : 'en_NZ',
      type: 'website',
      images: [
        {
          url: '/images/hero-tea-ceremony.jpg',
          width: 1200,
          height: 630,
          alt: 'Moso Tea — Traditional Tea Ceremony Experience',
        },
      ],
    },
    keywords: [
      'Moso Tea',
      'moso tea',
      'mosotea',
      'tea ceremony Wellington',
      'tea workshop Wellington',
      'tea experience NZ',
      'Wellington tea tasting',
      'New Zealand tea ceremony',
      'hands-on tea making',
    ],
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/hero-tea-ceremony.jpg'],
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

  if (!routing.locales.includes(locale as 'en')) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
