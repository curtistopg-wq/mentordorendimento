'use client'

import { useTranslations } from 'next-intl'

export function StickyCTA() {
  const t = useTranslations('hero')

  const scrollToHero = () => {
    const hero = document.getElementById('hero')
    if (hero) {
      hero.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Focus the email input after scroll
      setTimeout(() => {
        const emailInput = hero.querySelector<HTMLInputElement>('input[type="email"]')
        emailInput?.focus()
      }, 600)
    }
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-[88px] p-3 bg-white/[0.98] backdrop-blur-sm border-t border-primary-200 safe-area-pb">
      {/* Urgency indicator */}
      <p className="text-xs text-primary-600 text-center mb-1.5 leading-none">
        {t('urgencySlots')}
      </p>

      <button
        onClick={scrollToHero}
        data-clarity-label="sticky-cta"
        className="relative w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm leading-none rounded-lg transition-colors"
      >
        {/* Pulsing green dot */}
        <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
          <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300 animate-ping opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>

        {t('cta')}
      </button>
    </div>
  )
}
