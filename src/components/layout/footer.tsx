'use client'

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

const institutionLogos = [
  { src: '/logos/b3.svg', alt: 'B3 - Brasil Bolsa Balcão', width: 120, height: 40 },
  { src: '/logos/cvm.svg', alt: 'CVM - Comissão de Valores Mobiliários', width: 120, height: 40 },
  { src: '/logos/anbima.svg', alt: 'ANBIMA', width: 140, height: 40 },
  { src: '/logos/bacen.svg', alt: 'Banco Central do Brasil', width: 160, height: 40 },
]

const getStartedLinks = [
  { key: 'home', href: '/' },
  { key: 'contact', href: '#contact' },
  { key: 'pricing', href: '#pricing' },
]

const importantLinks = [
  { key: 'refund', href: '/refund' },
  { key: 'terms', href: '/terms' },
  { key: 'privacy', href: '/privacy' },
  { key: 'account', href: '/account' },
]

export function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="bg-primary-800 text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo */}
          <div className="lg:col-span-1">
            <Link href="/" className="block mb-4">
              <span className="text-xl font-display font-light tracking-wide">
                mentor do rendimento
              </span>
            </Link>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-primary-300">
              {t('contactUs')}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:support@mentordorendimento.com"
                  className="text-white hover:text-primary-300 transition-colors text-sm"
                >
                  support@mentordorendimento.com
                </a>
              </li>
            </ul>
          </div>

          {/* Get Started */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-primary-300">
              {t('getStarted')}
            </h3>
            <ul className="space-y-3">
              {getStartedLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-white hover:text-primary-300 transition-colors text-sm"
                  >
                    {t(`links.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-primary-300">
              {t('importantLinks')}
            </h3>
            <ul className="space-y-3">
              {importantLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-white hover:text-primary-300 transition-colors text-sm"
                  >
                    {t(`links.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Institution Logos */}
        <div className="mt-12 pt-8 border-t border-primary-700">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
            {institutionLogos.map((logo) => (
              <Image
                key={logo.src}
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                className="h-8 md:h-10 w-auto"
              />
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-primary-700">
          <p className="text-sm text-primary-400 text-center">
            {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
