import { getTranslations } from 'next-intl/server'

export async function StructuredData({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'faq' })
  const tMeta = await getTranslations({ locale, namespace: 'metadata' })

  const faqItems = Array.from({ length: 6 }, (_, i) => ({
    '@type': 'Question' as const,
    name: t(`items.${i}.question`),
    acceptedAnswer: {
      '@type': 'Answer' as const,
      text: t(`items.${i}.answer`),
    },
  }))

  const schemas = [
    // Organization
    {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Mentor do Rendimento',
      url: 'https://mentordorendimento.com',
      logo: 'https://mentordorendimento.com/logo.svg',
      description: tMeta('description'),
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'support@mentordorendimento.com',
        availableLanguage: ['Portuguese', 'English'],
      },
      sameAs: [
        'https://www.instagram.com/mentordorendimento',
      ],
    },
    // FAQPage
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems,
    },
    // Course - Silver
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Silver Trading Course',
      description: 'Access to basic trading courses with community support and weekly webinars.',
      provider: {
        '@type': 'EducationalOrganization',
        name: 'Mentor do Rendimento',
        url: 'https://mentordorendimento.com',
      },
      offers: {
        '@type': 'Offer',
        price: '250',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      inLanguage: locale === 'pt-BR' ? 'pt' : 'en',
      courseMode: 'online',
    },
    // Course - Gold
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Gold Trading Course',
      description: 'Advanced trading courses with 1-on-1 mentoring, priority support, and market analysis reports.',
      provider: {
        '@type': 'EducationalOrganization',
        name: 'Mentor do Rendimento',
        url: 'https://mentordorendimento.com',
      },
      offers: {
        '@type': 'Offer',
        price: '500',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      inLanguage: locale === 'pt-BR' ? 'pt' : 'en',
      courseMode: 'online',
    },
    // Course - Platinum
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Platinum Trading Course',
      description: 'Complete trading education with VIP access, personal trading coach, custom strategy development, and daily live sessions.',
      provider: {
        '@type': 'EducationalOrganization',
        name: 'Mentor do Rendimento',
        url: 'https://mentordorendimento.com',
      },
      offers: {
        '@type': 'Offer',
        price: '1000',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      inLanguage: locale === 'pt-BR' ? 'pt' : 'en',
      courseMode: 'online',
    },
    // AggregateRating
    {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Mentor do Rendimento',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.7',
        bestRating: '5',
        ratingCount: '2341',
        reviewCount: '1856',
      },
    },
  ]

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}
