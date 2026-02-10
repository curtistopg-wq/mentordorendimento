'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { SignupModal } from '@/components/ui/signup-modal'

export function Hero() {
  const t = useTranslations('hero')
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <>
    <section id="hero" data-clarity-region="hero" className="relative min-h-[70vh] lg:min-h-[85vh] flex items-end pt-20 lg:pt-32">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/images/hero-poster.jpg"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover"
        >
          <source src="/videos/hero-bg-opt.mp4" type="video/mp4" />
        </video>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="container-custom relative z-10 pb-16">
        {/* Content Card - Bottom Left */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl bg-white/95 backdrop-blur-sm p-8 md:p-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="inline-flex items-center px-4 py-2 bg-accent text-white text-sm font-semibold mb-6">
              {t('badge')}
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl md:text-4xl lg:text-5xl font-display font-normal text-primary-800 mb-6 leading-tight"
          >
            {t('title')}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base text-primary-600 leading-relaxed"
          >
            {t('subtitleStart')}{' '}
            <strong className="font-semibold">{t('subtitleKnowledge')}</strong> {t('subtitleAnd')}{' '}
            <strong className="font-semibold">{t('subtitleSkills')}</strong> {t('subtitleEnd')}
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-6"
          >
            <button
              onClick={() => setModalOpen(true)}
              data-clarity-label="hero-cta"
              className="w-full sm:w-auto px-8 py-4 bg-accent text-white font-bold text-lg hover:bg-accent-dark transition-colors"
            >
              {t('cta')}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
    <SignupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
