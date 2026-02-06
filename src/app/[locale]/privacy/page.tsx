'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

export default function PrivacyPage() {
  const t = useTranslations('privacyPage')

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
              <h2 className="text-xl font-semibold text-primary-800 mb-3">{t('sections.collection.title')}</h2>
              <p>{t('sections.collection.content')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-800 mb-3">{t('sections.usage.title')}</h2>
              <p>{t('sections.usage.content')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-800 mb-3">{t('sections.protection.title')}</h2>
              <p>{t('sections.protection.content')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-800 mb-3">{t('sections.cookies.title')}</h2>
              <p>{t('sections.cookies.content')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-800 mb-3">{t('sections.thirdParty.title')}</h2>
              <p>{t('sections.thirdParty.content')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-800 mb-3">{t('sections.rights.title')}</h2>
              <p>{t('sections.rights.content')}</p>
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
