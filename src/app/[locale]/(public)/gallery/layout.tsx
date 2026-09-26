import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === 'zh-TW'
  const title = isZh ? '相簿' : 'Gallery'
  const description = isZh
    ? '瀏覽 Moso Tea 位於威靈頓 Wainuiomata 的茶室、茶園與茶道體驗照片。'
    : 'See Moso Tea’s tea room, garden, tea ceremony, and hands-on workshop experiences in Wainuiomata, Wellington.'

  return {
    title,
    description,
    alternates: { canonical: '/gallery' },
    openGraph: {
      title: `${title} | Moso Tea`,
      description,
      url: '/gallery',
    },
  }
}

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children
}
