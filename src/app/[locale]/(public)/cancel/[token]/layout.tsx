import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === 'zh-TW'

  return {
    title: isZh ? '取消預約' : 'Cancel Booking',
    description: isZh
      ? '取消您的 Moso Tea 茶道體驗預約。'
      : 'Cancel your Moso Tea tea ceremony booking.',
  }
}

export default function CancelLayout({ children }: { children: React.ReactNode }) {
  return children
}
