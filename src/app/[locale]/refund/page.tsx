'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

export default function RefundPage() {
  const t = useTranslations('refundPage')

  return (
    <div className="pt-36 pb-20 bg-white min-h-screen">
      <div className="container-custom max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-800 mb-8">
            {t('title')}
          </h1>
          <p className="text-sm text-primary-400 mb-10">{t('lastUpdated')}</p>

          <div className="space-y-8 text-primary-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-primary-800 mb-3">{t('sections.guarantee.title')}</h2>
              <p>{t('sections.guarantee.content')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-800 mb-3">{t('sections.eligibility.title')}</h2>
              <p>{t('sections.eligibility.content')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-800 mb-3">{t('sections.process.title')}</h2>
              <p>{t('sections.process.content')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-800 mb-3">{t('sections.exceptions.title')}</h2>
              <p>{t('sections.exceptions.content')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-800 mb-3">{t('sections.contact.title')}</h2>
              <p>{t('sections.contact.content')}</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
