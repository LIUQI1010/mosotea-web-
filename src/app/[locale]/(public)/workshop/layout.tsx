import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === 'zh-TW'

  return {
    title: isZh ? '茶道體驗' : 'Tea Experiences',
    description: isZh
      ? '探索 Moso Tea 的台灣茶道與季節限定手工製茶體驗，地點位於威靈頓 Wainuiomata。'
      : 'Explore Moso Tea’s Taiwanese tea ceremony and seasonal hands-on tea making workshops in Wainuiomata, Wellington.',
    alternates: { canonical: '/workshop' },
    openGraph: {
      title: isZh ? '茶道體驗 | Moso Tea' : 'Tea Experiences | Moso Tea',
      description: isZh
        ? '探索 Moso Tea 的台灣茶道與季節限定手工製茶體驗，地點位於威靈頓 Wainuiomata。'
        : 'Explore Moso Tea’s Taiwanese tea ceremony and seasonal hands-on tea making workshops in Wainuiomata, Wellington.',
      url: '/workshop',
    },
  }
}

export default async function ExperiencesLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'experiences.faq' })
  const faqKeys = ['1', '2', '5', '6', '7', '8', '9'] as const
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqKeys.map((key) => ({
      '@type': 'Question',
      name: t(`q${key}`),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(`a${key}`),
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      {children}
    </>
  )
}
