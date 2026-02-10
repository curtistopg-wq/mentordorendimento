'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

export function Platform() {
  const t = useTranslations('platform')

  return (
    <section id="platform" data-clarity-region="platform" className="py-16 bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-800 mb-4">
            {t('title')}
          </h2>
          <div className="w-full max-w-4xl mx-auto h-px bg-primary-300" />
        </motion.div>

        {/* Platform Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative max-w-6xl mx-auto"
        >
          <Image
            src="/images/platform-screenshot.webp"
            alt="Trading Platform"
            width={1920}
            height={1080}
            className="w-full h-auto"
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  )
}
