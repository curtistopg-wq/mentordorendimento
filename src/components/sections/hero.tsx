'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useSignupModal } from '@/components/providers/signup-modal-provider'
import { createClient } from '@/lib/supabase/client'
import { trackFbq } from '@/components/analytics/meta-pixel-events'
import { getTrackingData, generateEventId, pushLeadEvent, tagClarityLead, trackWhatsAppClick } from '@/lib/tracking'
import { validateBrazilianPhone, formatBrazilianPhone } from '@/lib/phone-validation'

const WHATSAPP_NUMBER = '5511914134580'

const trustLogos = [
  { src: '/logos/b3.svg', alt: 'B3' },
  { src: '/logos/cvm.svg', alt: 'CVM' },
  { src: '/logos/anbima.svg', alt: 'ANBIMA' },
  { src: '/logos/bacen.svg', alt: 'Banco Central' },
]

export function Hero() {
  const t = useTranslations('hero')
  const { open } = useSignupModal()
  const [isMobile, setIsMobile] = useState(true)
  const formRef = useRef<HTMLDivElement>(null)

  // Single-step form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024)
  }, [])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBrazilianPhone(e.target.value)
    setPhone(formatted)
    if (phoneError) setPhoneError(null)
  }

  const handlePhoneBlur = () => {
    if (!phone) return
    const result = validateBrazilianPhone(phone)
    if (!result.valid) {
      setPhoneError(t('inlineForm.phoneError'))
    } else {
      setPhoneError(null)
    }
  }

  // Single-step submit: save name + email + phone to Supabase in one go
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)
    setPhoneError(null)

    // Client-side phone validation
    const phoneResult = validateBrazilianPhone(phone)
    if (!phoneResult.valid) {
      setPhoneError(t('inlineForm.phoneError'))
      setLoading(false)
      return
    }

    // Backend phone verification
    let phoneToInsert = phoneResult.formatted!
    try {
      const verifyRes = await fetch('/api/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const verifyData = await verifyRes.json()

      if (!verifyData.valid) {
        const errorMsg = verifyData.error === 'Please use a mobile number'
          ? t('inlineForm.phoneLandlineError')
          : t('inlineForm.phoneError')
        setPhoneError(errorMsg)
        setLoading(false)
        return
      }

      if (verifyData.formatted) {
        phoneToInsert = verifyData.formatted
      }
    } catch {
      // If API fails, proceed with client-side validated number
    }

    const tracking = getTrackingData()

    const supabase = createClient()
    const { error: insertError } = await supabase.from('leads').insert({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phoneToInsert,
      source: 'hero-inline-mobile',
      page: window.location.pathname,
      ga_client_id: tracking.ga_client_id,
      ga_session_id: tracking.ga_session_id,
      fbc: tracking.fbc,
      fbp: tracking.fbp,
      fbclid: tracking.fbclid,
      utm_source: tracking.utm_source,
      utm_medium: tracking.utm_medium,
      utm_campaign: tracking.utm_campaign,
      utm_content: tracking.utm_content,
      utm_term: tracking.utm_term,
      landing_page: tracking.landing_page,
      referrer: tracking.referrer,
    })

    setLoading(false)

    if (insertError) {
      console.error('Lead insert failed:', insertError.message)
      setError(true)
      return
    }

    setSubmitted(true)

    // Send welcome email (fire-and-forget)
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase().trim() }),
    }).catch(err => console.error('Email send failed:', err))

    // PeopleDown: track lead with session attribution
    window.PeopleDown?.trackLead({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phoneToInsert,
    }).catch(() => {})

    // Defer all tracking to next frame so UI updates instantly (INP optimization)
    requestAnimationFrame(() => {
      setTimeout(() => {
        const eventId = generateEventId()

        pushLeadEvent({
          formType: 'hero-inline-mobile',
          leadSource: 'hero-inline-mobile',
          email: email.toLowerCase().trim(),
          phone: phoneToInsert,
          firstName: name.trim(),
          eventId,
          trackingData: tracking,
        })

        trackFbq('track', 'Lead', {
          content_name: 'Hero Inline Form',
          content_category: 'Free Lesson',
          eventID: eventId,
        })

        tagClarityLead({ email: email.toLowerCase().trim(), formType: 'hero-inline', leadSource: 'hero-inline-mobile' })
        window.clarity?.('set', 'form_step', 'profile_completed')
      }, 0)
    })
  }

  const whatsappMessage = encodeURIComponent('Olá! Tenho interesse nos cursos do Mentor do Rendimento. Pode me ajudar?')
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`

  return (
    <section id="hero" data-clarity-region="hero" className="relative min-h-svh lg:min-h-[85vh] flex items-center lg:items-end">
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

      <div className="container-custom relative z-10 py-4 lg:pb-16 lg:pt-0">
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
          <div ref={formRef} className="block lg:hidden mt-4 animate-hero-fade-up hero-delay-500" data-clarity-region="hero-inline-form">
            {!submitted ? (
              <>
                <form onSubmit={handleSubmit} className="space-y-3">
                  {error && (
                    <p className="text-xs text-red-600 bg-red-50 px-3 py-2">
                      {t('inlineForm.error')}
                    </p>
                  )}

                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('inlineForm.name')}
                    aria-label={t('inlineForm.name')}
                    autoComplete="name"
                    inputMode="text"
                    data-clarity-label="hero-inline-name"
                    className="w-full px-4 py-3 border border-gray-300 text-primary-800 text-base focus:outline-none focus:border-primary-700 transition-colors bg-white"
                  />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('inlineForm.email')}
                    aria-label={t('inlineForm.email')}
                    autoComplete="email"
                    inputMode="email"
                    data-clarity-label="hero-inline-email"
                    className="w-full px-4 py-3 border border-gray-300 text-primary-800 text-base focus:outline-none focus:border-primary-700 transition-colors bg-white"
                  />

                  <div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={handlePhoneChange}
                      onBlur={handlePhoneBlur}
                      placeholder={t('inlineForm.phone')}
                      aria-label={t('inlineForm.phone')}
                      autoComplete="tel"
                      inputMode="tel"
                      data-clarity-label="hero-inline-phone"
                      className={`w-full px-4 py-3 border text-primary-800 text-base focus:outline-none transition-colors bg-white ${
                        phoneError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-primary-700'
                      }`}
                    />
                    {phoneError && (
                      <p className="text-xs text-red-600 mt-1">{phoneError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    data-clarity-label="hero-inline-submit"
                    className="w-full py-3.5 bg-emerald-500 text-white font-bold text-sm uppercase tracking-wide hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? '...' : t('inlineForm.submit')}
                  </button>
                </form>

                {/* WhatsApp alternative */}
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="text-xs text-primary-400">—</span>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick('hero-inline')}
                    data-clarity-label="hero-whatsapp-alt"
                    className="text-xs font-medium text-[#25D366] hover:underline flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    {t('inlineForm.whatsappAlt')}
                  </a>
                  <span className="text-xs text-primary-400">—</span>
                </div>

                {/* Micro-copy + Star Rating */}
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-primary-500 flex items-center gap-1">
                    <svg className="w-3 h-3 text-primary-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    {t('inlineForm.privacy')}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-sm tracking-wide" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                    <span className="text-xs font-semibold text-primary-700">{t('inlineForm.rating')}</span>
                  </div>
                </div>
              </>
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

          {/* Social Proof + Inline Trust Logos */}
          <div className="mt-3 lg:mt-6 space-y-2 animate-hero-fade-up hero-delay-600">
            <div className="flex items-center gap-2">
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

            {/* Trust logos inline - visible in hero card */}
            <div className="flex items-center gap-2 lg:hidden">
              {trustLogos.map((logo) => (
                <Image
                  key={logo.alt}
                  src={logo.src}
                  alt={logo.alt}
                  width={48}
                  height={16}
                  className="h-4 w-12 object-contain opacity-40 grayscale"
                />
              ))}
              <span className="text-[9px] uppercase tracking-wider text-primary-400 font-medium ml-1">Regulado</span>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}
