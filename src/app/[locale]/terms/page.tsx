'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

export default function TermsPage() {
  const t = useTranslations('termsPage')

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
              <h2 className="text-xl font-semibold text-primary-800 mb-3">{t('sections.acceptance.title')}</h2>
              <p>{t('sections.acceptance.content')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-800 mb-3">{t('sections.services.title')}</h2>
              <p>{t('sections.services.content')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-800 mb-3">{t('sections.accounts.title')}</h2>
              <p>{t('sections.accounts.content')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-800 mb-3">{t('sections.intellectual.title')}</h2>
              <p>{t('sections.intellectual.content')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-800 mb-3">{t('sections.payment.title')}</h2>
              <p>{t('sections.payment.content')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-800 mb-3">{t('sections.disclaimer.title')}</h2>
              <p>{t('sections.disclaimer.content')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-800 mb-3">{t('sections.liability.title')}</h2>
              <p>{t('sections.liability.content')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-800 mb-3">{t('sections.changes.title')}</h2>
              <p>{t('sections.changes.content')}</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
