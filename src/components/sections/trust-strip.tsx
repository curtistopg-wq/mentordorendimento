import Image from 'next/image'
import { useTranslations } from 'next-intl'

const trustLogos = [
  { src: '/logos/b3.svg', alt: 'B3', href: 'https://www.b3.com.br' },
  { src: '/logos/cvm.svg', alt: 'CVM', href: 'https://www.gov.br/cvm' },
  { src: '/logos/anbima.svg', alt: 'ANBIMA', href: 'https://www.anbima.com.br' },
  { src: '/logos/bacen.svg', alt: 'Banco Central', href: 'https://www.bcb.gov.br' },
]

export function TrustStrip() {
  const t = useTranslations('trustStrip')

  return (
    <section data-clarity-region="trust-strip" className="py-6 bg-primary-50 border-y border-primary-100">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          {/* Star rating */}
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-base" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
            <span className="text-xs font-semibold text-primary-700">{t('rating')}</span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-primary-200" />

          {/* Trust logos */}
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="text-[10px] uppercase tracking-wider text-primary-400 font-medium">{t('regulated')}</span>
            {trustLogos.map((logo) => (
              <a
                key={logo.alt}
                href={logo.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={logo.alt}
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={32}
                  height={32}
                  className="h-5 sm:h-6 w-auto opacity-50 grayscale hover:opacity-70 transition-opacity"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
