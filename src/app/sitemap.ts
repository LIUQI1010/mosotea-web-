import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mosotea.co.nz'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/about', '/experiences', '/contact', '/book']
  const locales = ['en', 'zh-TW']
  const lastModified = new Date()

  return pages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${BASE_URL}${locale === 'en' ? '' : `/${locale}`}${page}`,
      lastModified,
      changeFrequency: page === '' ? 'weekly' as const : 'monthly' as const,
      priority: page === '' ? 1 : page === '/experiences' ? 0.9 : 0.8,
      alternates: {
        languages: {
          en: `${BASE_URL}${page}`,
          'zh-TW': `${BASE_URL}/zh-TW${page}`,
        },
      },
    }))
  )
}
