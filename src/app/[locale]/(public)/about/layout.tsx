import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === 'zh-TW'

  return {
    title: isZh ? '關於我們' : 'About Us',
    description: isZh
      ? '了解 Moso Tea 的故事、茶藝師和我們在威靈頓的花園工作室。'
      : 'Meet the people behind Moso Tea and discover our Taiwanese tea culture, garden, and workshop in Wainuiomata, Wellington.',
    alternates: { canonical: '/about' },
    openGraph: {
      title: isZh ? '關於我們 | Moso Tea' : 'About Us | Moso Tea',
      description: isZh
        ? '了解 Moso Tea 的故事、茶藝師和我們在威靈頓的花園工作室。'
        : 'Meet the people behind Moso Tea and discover our Taiwanese tea culture, garden, and workshop in Wainuiomata, Wellington.',
      url: '/about',
    },
  }
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
