import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === 'zh-TW'

  const title = isZh ? '服務條款' : 'Terms of Service'
  const description = isZh
    ? '預約和參加 Moso Tea 茶道體驗的條款與條件。'
    : 'Terms and conditions for booking and attending a Moso Tea workshop experience in Wellington, New Zealand.'

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Moso Tea`,
      description,
    },
  }
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
