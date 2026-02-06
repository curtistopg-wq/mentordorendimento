'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

export function Guarantee() {
  const t = useTranslations('guarantee')

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/guarantee-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-primary-800/70" />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-light text-white mb-8 tracking-wide"
          >
            {t('titleLine1')}
            <br />
            {t('titleLine2')}
          </motion.h2>

          {/* Disclaimer */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm text-primary-200 leading-relaxed max-w-5xl mx-auto"
          >
            {t('disclaimer')}
          </motion.p>
        </div>
      </div>
    </section>
  )
}
