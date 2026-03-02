'use client'

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useSignupModal } from '@/components/providers/signup-modal-provider'
import { createClient } from '@/lib/supabase/client'
import { trackFbq } from '@/components/analytics/meta-pixel-events'

export function Hero() {
  const t = useTranslations('hero')
  const { open } = useSignupModal()
  const [isMobile, setIsMobile] = useState(true)

  // Inline form state (mobile only)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024)
  }, [])

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)

    const supabase = createClient()
    const { error: insertError } = await supabase.from('leads').insert({
      name: formData.name,
      email: formData.email,
      phone: '',
      source: 'hero-inline-mobile',
      page: window.location.pathname,
    })

    setLoading(false)

    if (insertError) {
      console.error('Lead insert failed:', insertError.message)
      setError(true)
      return
    }

    // DataLayer push for GTM
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      'event': 'generate_lead',
      'user_email': formData.email.toLowerCase().trim(),
      'user_phone': '',
      'user_first_name': formData.name,
      'lead_source': 'hero-inline-mobile',
    })

    // Meta Pixel Lead event
    trackFbq('track', 'Lead', {
      content_name: 'Hero Inline Form',
      content_category: 'Free Lesson',
    })

    setSubmitted(true)
  }

  return (
    <section id="hero" data-clarity-region="hero" className="relative min-h-svh lg:min-h-[85vh] flex items-end">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      <div className="container-custom relative z-10 pb-24 lg:pb-16">
        {/* Content Card */}
        <div className="max-w-xl bg-white/95 backdrop-blur-sm p-4 md:p-10 animate-hero-slide-in">
          {/* Badge */}
          <div className="animate-hero-fade-up hero-delay-200">
            <span className="inline-flex items-center px-3 py-1 md:px-4 md:py-2 bg-accent text-white text-xs md:text-sm font-semibold mb-3 md:mb-6">
              {t('badge')}
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-xl md:text-4xl lg:text-5xl font-display font-normal text-primary-800 mb-2 md:mb-6 leading-tight animate-hero-fade-up hero-delay-300">
            {t('title')}
          </h1>

          {/* Subtitle */}
          <p className="text-xs md:text-base text-primary-600 leading-relaxed animate-hero-fade-up hero-delay-400">
            {t('subtitleStart')}{' '}
            <strong className="font-semibold">{t('subtitleKnowledge')}</strong> {t('subtitleAnd')}{' '}
            <strong className="font-semibold">{t('subtitleSkills')}</strong> {t('subtitleEnd')}
          </p>

          {/* Inline Lead Form - Mobile only (below lg) */}
          <div className="block lg:hidden mt-4 animate-hero-fade-up hero-delay-500" data-clarity-region="hero-inline-form">
            {!submitted ? (
              <form onSubmit={handleInlineSubmit} className="space-y-3">
                {error && (
                  <p className="text-xs text-red-600 bg-red-50 px-3 py-2">
                    {t('inlineForm.error')}
                  </p>
                )}

                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('inlineForm.name')}
                  aria-label={t('inlineForm.name')}
                  data-clarity-label="hero-inline-name"
                  className="w-full px-4 py-3 border border-gray-300 text-primary-800 text-sm focus:outline-none focus:border-primary-700 transition-colors bg-white"
                />

                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('inlineForm.email')}
                  aria-label={t('inlineForm.email')}
                  data-clarity-label="hero-inline-email"
                  className="w-full px-4 py-3 border border-gray-300 text-primary-800 text-sm focus:outline-none focus:border-primary-700 transition-colors bg-white"
                />

                <button
                  type="submit"
                  disabled={loading}
                  data-clarity-label="hero-inline-submit"
                  className="w-full py-3.5 bg-emerald-500 text-white font-bold text-sm uppercase tracking-wide hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {loading ? '...' : t('inlineForm.submit')}
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 p-4">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm font-semibold text-green-800">
                  {t('inlineForm.success')}
                </p>
              </div>
            )}

            {/* Star Rating - below form on mobile */}
            {!submitted && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-yellow-400 text-sm tracking-wide" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                <span className="text-xs font-semibold text-primary-700">{t('inlineForm.rating')}</span>
              </div>
            )}
          </div>

          {/* CTA Button - desktop only (lg and above) */}
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
          <div className="mt-3 lg:mt-6 flex items-center gap-2 animate-hero-fade-up hero-delay-600">
            <div className="flex -space-x-2">
              {['L', 'M', 'G', 'R'].map((initial, i) => (
                <div
                  key={i}
                  className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-accent/20 border-2 border-white flex items-center justify-center text-[10px] lg:text-xs font-bold text-accent"
                >
                  {initial}
                </div>
              ))}
            </div>
            <p className="text-xs lg:text-sm text-primary-500">
              <strong className="text-primary-800">{t('socialProofCount')}</strong>{' '}
              {t('socialProofText')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
