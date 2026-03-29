import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mosotea.co.nz'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/about', '/workshop', '/book', '/contact', '/gallery', '/privacy', '/terms']
  const lastModified = new Date()

  return pages.map((page) => ({
    url: `${BASE_URL}${page}`,
    lastModified,
    changeFrequency: page === '' ? 'weekly' as const : 'monthly' as const,
    priority: page === '' ? 1 : page === '/workshop' ? 0.9 : page === '/book' ? 0.9 : 0.8,
  }))
}
