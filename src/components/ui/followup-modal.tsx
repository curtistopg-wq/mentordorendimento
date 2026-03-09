'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trackFbq } from '@/components/analytics/meta-pixel-events'
import { getTrackingData, generateEventId, pushLeadEvent, tagClarityLead } from '@/lib/tracking'

interface FollowupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  email: string
  leadId: string | null
}

export function FollowupModal({ isOpen, onClose, onSuccess, email, leadId }: FollowupModalProps) {
  const [formData, setFormData] = useState({ name: '', surname: '', phone: '' })

  // Clarity: tag modal open
  useEffect(() => {
    if (isOpen) {
      window.clarity?.('set', 'form_type', 'followup-modal')
      window.clarity?.('set', 'form_opened', 'followup-modal')
    }
  }, [isOpen])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)

    const fullName = `${formData.name} ${formData.surname}`.trim()

    if (leadId) {
      const supabase = createClient()
      const { error: updateError } = await supabase.from('leads').update({
        name: fullName,
        phone: formData.phone,
      }).eq('id', leadId)

      if (updateError) {
        console.error('Lead update failed:', updateError.message)
        setError(true)
        setLoading(false)
        return
      }
    }

    // Event dedup ID - same ID for Pixel + CAPI via sGTM
    const eventId = generateEventId()
    const tracking = getTrackingData()

    // DataLayer push for GTM → sGTM → Meta CAPI
    pushLeadEvent({
      formType: 'followup-modal',
      leadSource: 'hero-inline-mobile',
      email,
      phone: formData.phone,
      firstName: formData.name,
      eventId,
      trackingData: tracking,
    })

    // Meta Pixel Lead event (client-side, same event_id for dedup)
    trackFbq('track', 'Lead', {
      content_name: 'Followup Modal',
      content_category: 'Free Lesson',
      eventID: eventId,
    })

    // Clarity custom tags
    tagClarityLead({ email, formType: 'followup-modal', leadSource: 'hero-inline-mobile' })
    window.clarity?.('set', 'form_step', 'followup_completed')

    setLoading(false)
    setSubmitted(true)

    setTimeout(() => {
      onSuccess()
    }, 1500)
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setFormData({ name: '', surname: '', phone: '' })
      setError(false)
      setSubmitted(false)
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
            aria-labelledby="followup-modal-title"
            data-clarity-region="followup-modal"
            className="relative w-full max-w-md bg-white p-8 shadow-2xl z-10"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 text-primary-400 hover:text-primary-800 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            {!submitted ? (
              <>
                <h2 id="followup-modal-title" className="text-2xl font-display font-bold text-primary-800 mb-1">
                  Quase lá!
                </h2>
                <p className="text-sm text-primary-500 mb-6">
                  Complete seu cadastro para garantir sua aula grátis.
                </p>

                {/* Email display */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-primary-700 mb-1.5">
                    Seu e-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 text-primary-400 text-sm bg-gray-50 cursor-not-allowed"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-4 py-3 mb-4">
                    Erro ao enviar. Tente novamente.
                  </p>
                )}

                <form onSubmit={handleSubmit} data-clarity-region="followup-form" className="space-y-5">
                  <div>
                    <label htmlFor="followup-name" className="block text-sm font-medium text-primary-700 mb-1.5">
                      Seu nome
                    </label>
                    <input
                      id="followup-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 text-primary-800 text-sm focus:outline-none focus:border-primary-700 transition-colors"
                      placeholder="Ex: João"
                      autoFocus
                      autoComplete="given-name"
                      data-clarity-label="followup-name"
                    />
                  </div>

                  <div>
                    <label htmlFor="followup-surname" className="block text-sm font-medium text-primary-700 mb-1.5">
                      Seu sobrenome
                    </label>
                    <input
                      id="followup-surname"
                      type="text"
                      required
                      value={formData.surname}
                      onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 text-primary-800 text-sm focus:outline-none focus:border-primary-700 transition-colors"
                      placeholder="Ex: Silva"
                      autoComplete="family-name"
                      data-clarity-label="followup-surname"
                    />
                  </div>

                  <div>
                    <label htmlFor="followup-phone" className="block text-sm font-medium text-primary-700 mb-1.5">
                      Telefone (WhatsApp)
                    </label>
                    <input
                      id="followup-phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 text-primary-800 text-sm focus:outline-none focus:border-primary-700 transition-colors"
                      placeholder="+55 (11) 99999-9999"
                      autoComplete="tel"
                      inputMode="tel"
                      data-clarity-label="followup-phone"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    data-clarity-label="followup-submit"
                    className="w-full py-3.5 bg-emerald-500 text-white font-bold text-sm uppercase tracking-wide hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? '...' : 'FINALIZAR INSCRIÇÃO →'}
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
                  Pronto! Inscrição Confirmada
                </h3>
                <p className="text-sm text-primary-500">
                  Verifique seu e-mail para acessar a aula gratuita.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
