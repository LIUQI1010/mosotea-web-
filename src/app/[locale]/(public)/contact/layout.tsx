import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === 'zh-TW'

  return {
    title: isZh ? '聯絡我們' : 'Contact Us',
    description: isZh
      ? '聯絡 Moso Tea。歡迎來訪我們位於威靈頓 Lower Hutt 的花園工作室，或發送訊息給我們。'
      : 'Get in touch with Moso Tea. Visit our garden studio in Lower Hutt, Wellington, or send us a message.',
    openGraph: {
      title: isZh ? '聯絡我們 | Moso Tea' : 'Contact Us | Moso Tea',
      description: isZh
        ? '聯絡 Moso Tea。歡迎來訪我們位於威靈頓 Lower Hutt 的花園工作室，或發送訊息給我們。'
        : 'Get in touch with Moso Tea. Visit our garden studio in Lower Hutt, Wellington, or send us a message.',
    },
  }
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
