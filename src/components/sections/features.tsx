'use client'

import { motion } from 'framer-motion'
import { FolderOpen, User, MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

const featureIcons = [FolderOpen, User, MessageCircle]
const featureKeys = ['education', 'innovation', 'community'] as const

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function Features() {
  const t = useTranslations('features')

  return (
    <section id="features" className="relative py-20">
      {/* Background with blur effect */}
      {/* Dark background */}
      <div className="absolute inset-0 z-0 bg-primary-900" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-light text-white mb-6 leading-tight">
            {t('titleLine1')}
            <br />
            {t('titleLine2')}
            <br />
            {t('titleLine3')}
          </h2>
          <p className="text-gray-300 text-lg">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
        >
          {featureKeys.map((key, index) => {
            const Icon = featureIcons[index]
            return (
              <motion.div
                key={key}
                variants={item}
                className="flex items-start gap-4"
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary-800 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-gray-300" />
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-lg font-display font-semibold text-amber-400 mb-1">
                    {t(`items.${key}.title`)}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {t(`items.${key}.description`)}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
