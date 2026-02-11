'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useSignupModal } from '@/components/providers/signup-modal-provider'

export function Hero() {
  const t = useTranslations('hero')
  const { open } = useSignupModal()
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024)
  }, [])

  return (
    <section id="hero" data-clarity-region="hero" className="relative min-h-[50vh] lg:min-h-[85vh] flex items-end pt-20 lg:pt-32">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {isMobile ? (
          <Image
            src="/images/hero-poster.jpg"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
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
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="container-custom relative z-10 pb-8 lg:pb-16">
        {/* Content Card */}
        <div className="max-w-xl bg-white/95 backdrop-blur-sm p-6 md:p-10 animate-hero-slide-in">
          {/* Badge */}
          <div className="animate-hero-fade-up hero-delay-200">
            <span className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 bg-accent text-white text-xs md:text-sm font-semibold mb-4 md:mb-6">
              {t('badge')}
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-normal text-primary-800 mb-4 md:mb-6 leading-tight animate-hero-fade-up hero-delay-300">
            {t('title')}
          </h1>

          {/* Subtitle */}
          <p className="text-sm md:text-base text-primary-600 leading-relaxed animate-hero-fade-up hero-delay-400">
            {t('subtitleStart')}{' '}
            <strong className="font-semibold">{t('subtitleKnowledge')}</strong> {t('subtitleAnd')}{' '}
            <strong className="font-semibold">{t('subtitleSkills')}</strong> {t('subtitleEnd')}
          </p>

          {/* CTA Button - desktop only, sticky CTA handles mobile */}
          <div className="hidden lg:block mt-6 animate-hero-fade-up hero-delay-500">
            <button
              onClick={open}
              data-clarity-label="hero-cta"
              className="px-8 py-4 bg-accent text-white font-bold text-lg hover:bg-accent-dark transition-colors"
            >
              {t('cta')}
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-4 lg:mt-6 flex items-center gap-3 animate-hero-fade-up hero-delay-600">
            <div className="flex -space-x-2">
              {['L', 'M', 'G', 'R'].map((initial, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-accent/20 border-2 border-white flex items-center justify-center text-xs font-bold text-accent"
                >
                  {initial}
                </div>
              ))}
            </div>
            <p className="text-sm text-primary-500">
              <strong className="text-primary-800">{t('socialProofCount')}</strong>{' '}
              {t('socialProofText')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
