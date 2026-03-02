import { MetadataRoute } from 'next'

const baseUrl = 'https://mentordorendimento.com'
const locales = ['pt-BR', 'en']

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ['', '/refund', '/terms', '/privacy', '/account']

  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1.0 : 0.5,
      })
    }
  }

  return entries
}
