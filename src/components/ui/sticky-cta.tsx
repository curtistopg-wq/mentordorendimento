'use client'

import { useTranslations } from 'next-intl'
import { useSignupModal } from '@/components/providers/signup-modal-provider'

export function StickyCTA() {
  const t = useTranslations('hero')
  const { open } = useSignupModal()

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/95 backdrop-blur-sm border-t border-primary-200 safe-area-pb">
      <button
        onClick={open}
        data-clarity-label="sticky-cta"
        className="w-full py-3.5 bg-accent text-white font-bold text-sm hover:bg-accent-dark transition-colors"
      >
        {t('cta')}
      </button>
    </div>
  )
}
