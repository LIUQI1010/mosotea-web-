import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === 'zh-TW'

  const title = isZh ? '隱私政策' : 'Privacy Policy'
  const description = isZh
    ? 'Moso Tea 如何根據《新西蘭隱私法 2020》收集、使用和保護您的個人資訊。'
    : 'How Moso Tea collects, uses, and protects your personal information under the New Zealand Privacy Act 2020.'

  return {
    title,
    description,
    openGraph: {
      title: isZh ? `${title} | Moso Tea` : `${title} | Moso Tea`,
      description,
    },
  }
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
