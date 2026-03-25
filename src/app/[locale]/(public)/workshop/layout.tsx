import type { Metadata } from 'next'

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
      ? '探索 Moso Tea 的茶道體驗：經典茶道、抹茶冥想和私人花園體驗。'
      : 'Explore Moso Tea experiences: Classic Tea Ceremony, Matcha Meditation, and Private Garden Sessions in Wellington.',
    openGraph: {
      title: isZh ? '茶道體驗 | Moso Tea' : 'Tea Experiences | Moso Tea',
      description: isZh
        ? '探索 Moso Tea 的茶道體驗：經典茶道、抹茶冥想和私人花園體驗。'
        : 'Explore Moso Tea experiences: Classic Tea Ceremony, Matcha Meditation, and Private Garden Sessions in Wellington.',
    },
  }
}

export default function ExperiencesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
