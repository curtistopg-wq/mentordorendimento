'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { trackFbq } from '@/components/analytics/meta-pixel-events'
import { getTrackingData, generateEventId, pushLeadEvent, tagClarityLead } from '@/lib/tracking'

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const t = useTranslations('signup')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  // Clarity: tag modal open
  useEffect(() => {
    if (isOpen) {
      window.clarity?.('set', 'form_type', 'signup-modal')
      window.clarity?.('set', 'form_opened', 'signup-modal')
    }
  }, [isOpen])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)

    const tracking = getTrackingData()

    const supabase = createClient()
    const { error: insertError } = await supabase.from('leads').insert({
      name: formData.name,
      email: formData.email.toLowerCase().trim(),
      phone: formData.phone,
      source: 'signup-modal',
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

    // Event dedup ID - same ID for Pixel + CAPI via sGTM
    const eventId = generateEventId()

    // DataLayer push for GTM → sGTM → Meta CAPI
    pushLeadEvent({
      formType: 'signup-modal',
      leadSource: 'signup-modal',
      email: formData.email.toLowerCase().trim(),
      phone: formData.phone,
      firstName: formData.name,
      eventId,
      trackingData: tracking,
    })

    // Meta Pixel Lead event (client-side, same event_id for dedup)
    trackFbq('track', 'Lead', {
      content_name: 'Signup Form',
      content_category: 'Free Lesson',
      eventID: eventId,
    })

    // Clarity custom tags
    tagClarityLead({ email: formData.email, formType: 'signup-modal', leadSource: 'signup-modal' })

    setSubmitted(true)
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', phone: '' })
    }, 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
            role="dialog"
            aria-labelledby="signup-modal-title"
            data-clarity-region="signup-modal"
            className="relative w-full max-w-md bg-white p-8 shadow-2xl z-10"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 text-primary-400 hover:text-primary-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {!submitted ? (
              <>
                <h2 id="signup-modal-title" className="text-2xl font-display font-bold text-primary-800 mb-2">
                  {t('title')}
                </h2>
                <p className="text-sm text-primary-500 mb-8">
                  {t('subtitle')}
                </p>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-4 py-3 mb-4">
                    {t('errorMessage')}
                  </p>
                )}

                <form onSubmit={handleSubmit} data-clarity-region="signup-form" className="space-y-5">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-primary-700 mb-1.5">
                      {t('name')}
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 text-primary-800 text-sm focus:outline-none focus:border-primary-700 transition-colors"
                      placeholder={t('namePlaceholder')}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-primary-700 mb-1.5">
                      {t('email')}
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 text-primary-800 text-sm focus:outline-none focus:border-primary-700 transition-colors"
                      placeholder={t('emailPlaceholder')}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-primary-700 mb-1.5">
                      {t('phone')}
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 text-primary-800 text-sm focus:outline-none focus:border-primary-700 transition-colors"
                      placeholder={t('phonePlaceholder')}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    data-clarity-label="signup-submit"
                    className="w-full py-3.5 bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? '...' : t('submit')}
                  </button>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-display font-bold text-primary-800 mb-2">
                  {t('successTitle')}
                </h3>
                <p className="text-sm text-primary-500">
                  {t('successMessage')}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
