import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/about', '/workshop', '/book', '/contact', '/gallery', '/privacy', '/terms']

  return pages.map((page) => ({
    url: `${SITE_URL}${page}`,
    changeFrequency: page === '' ? 'weekly' as const : 'monthly' as const,
    priority: page === '' ? 1 : page === '/workshop' ? 0.9 : page === '/book' ? 0.9 : 0.8,
  }))
}
