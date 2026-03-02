'use client'

import { useTranslations } from 'next-intl'
import { useSignupModal } from '@/components/providers/signup-modal-provider'
import { trackFbq } from '@/components/analytics/meta-pixel-events'

export function MidCTA() {
  const t = useTranslations('cta')
  const { open } = useSignupModal()

  return (
    <section data-clarity-region="mid-cta" className="py-12 bg-primary-800">
      <div className="container-custom text-center">
        <p className="text-white/80 text-sm mb-4">{t('badge')}</p>
        <button
          onClick={() => {
            trackFbq('track', 'ViewContent', {
              content_name: 'Mid-Page CTA',
              content_category: 'CTA Click',
            })
            open()
          }}
          data-clarity-label="mid-cta-button"
          className="px-8 py-4 bg-emerald-500 text-white font-bold text-base hover:bg-emerald-600 transition-colors"
        >
          {t('button')}
        </button>
      </div>
    </section>
  )
}
