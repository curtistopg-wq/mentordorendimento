'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { cn } from '@/lib/utils'
import { useSignupModal } from '@/components/providers/signup-modal-provider'

const languages = [
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
]

export function Header() {
  const t = useTranslations('nav')
  const tHero = useTranslations('hero')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { open } = useSignupModal()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  const currentLang = languages.find(l => l.code === locale) || languages[0]

  const navigation = [
    { name: t('home'), href: '/' as const },
    { name: t('premiumPackages'), href: '/#pricing' as const },
    { name: t('refundPolicy'), href: '/refund' as const },
    { name: t('contact'), href: '/#contact' as const },
  ]

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as 'pt-BR' | 'en' })
    setLangMenuOpen(false)
    setMobileMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top Bar - Logo centered */}
      <div className="bg-primary-800 py-4">
        <div className="container-custom flex justify-center">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="Mentor do Rendimento"
              width={220}
              height={55}
              priority
            />
          </Link>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-gray-100 border-b border-gray-200" aria-label="Global">
        <div className="container-custom">
          <div className="flex items-center h-14">
            {/* Left spacer - matches right side width for true centering */}
            <div className="hidden lg:block flex-1" />

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-10 flex-shrink-0">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-primary-600 hover:text-accent transition-colors tracking-wide whitespace-nowrap"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right side - CTA + Language */}
            <div className="flex items-center gap-3 flex-1 justify-end">
              {/* CTA Button - Desktop only */}
              <button
                onClick={open}
                data-clarity-label="header-cta"
                className="hidden lg:block px-4 py-2 bg-accent text-white text-xs font-semibold hover:bg-accent-dark transition-colors rounded-full whitespace-nowrap"
              >
                {tHero('cta')}
              </button>

              {/* Language Selector - Desktop */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-700 text-white text-sm rounded-full"
                >
                  <span>{currentLang.flag}</span>
                  <span>{currentLang.name}</span>
                  <ChevronDown className={cn('w-4 h-4 transition-transform', langMenuOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {langMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => switchLocale(lang.code)}
                          className={cn(
                            'w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors',
                            locale === lang.code && 'bg-gray-50 font-medium'
                          )}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-primary-600 hover:bg-gray-200 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden overflow-hidden"
              >
                <div className="py-4 space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm font-medium text-primary-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}

                  {/* Language Selector - Mobile */}
                  <div className="border-t border-gray-200 pt-3 mt-3 px-4">
                    <div className="flex gap-2">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => switchLocale(lang.code)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
                            locale === lang.code
                              ? 'bg-primary-700 text-white'
                              : 'bg-gray-200 text-primary-600 hover:bg-gray-300'
                          )}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </header>
  )
}
