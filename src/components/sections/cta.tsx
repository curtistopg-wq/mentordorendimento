'use client'

import { m } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useSignupModal } from '@/components/providers/signup-modal-provider'
import { trackFbq } from '@/components/analytics/meta-pixel-events'

export function CTA() {
  const t = useTranslations('cta')
  const { open } = useSignupModal()

  return (
    <section id="contact" className="py-20 bg-[#FAFAF5]">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <span className="inline-block px-6 py-2 bg-primary-700 text-white text-sm font-medium rounded-full">
              {t('badge')}
            </span>
          </m.div>

          {/* Text */}
          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl lg:text-4xl text-primary-700 mb-10 max-w-3xl mx-auto leading-relaxed italic font-light"
          >
            {t('text')}
          </m.p>

          {/* Button */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={() => {
                trackFbq('track', 'ViewContent', {
                  content_name: 'CTA Comecar Agora',
                  content_category: 'CTA Click',
                })
                open()
              }}
              data-clarity-label="cta-get-started"
              className="inline-block px-10 py-4 border-2 border-primary-800 text-primary-800 font-semibold hover:bg-primary-800 hover:text-white transition-all"
            >
              {t('button')}
            </button>
          </m.div>
        </div>
      </div>
    </section>
  )
}
