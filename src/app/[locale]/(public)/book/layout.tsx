import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === 'zh-TW'

  return {
    title: isZh ? '預約體驗' : 'Book an Experience',
    description: isZh
      ? '預約 Moso Tea 的茶道體驗。選擇您喜歡的體驗、日期和時間。'
      : 'Book a tea ceremony experience at Moso Tea. Choose your preferred experience, date, and time.',
    openGraph: {
      title: isZh ? '預約體驗 | Moso Tea' : 'Book an Experience | Moso Tea',
      description: isZh
        ? '預約 Moso Tea 的茶道體驗。選擇您喜歡的體驗、日期和時間。'
        : 'Book a tea ceremony experience at Moso Tea. Choose your preferred experience, date, and time.',
    },
  }
}

export default function BookLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
