'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trackFbq } from '@/components/analytics/meta-pixel-events'
import { getTrackingData, generateEventId, pushLeadEvent, tagClarityLead } from '@/lib/tracking'
import { validateBrazilianPhone, formatBrazilianPhone } from '@/lib/phone-validation'

interface FollowupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  email: string
  leadId: string | null
}

export function FollowupModal({ isOpen, onClose, onSuccess, email, leadId }: FollowupModalProps) {
  const [formData, setFormData] = useState({ name: '', surname: '', phone: '' })
  const [phoneError, setPhoneError] = useState<string | null>(null)

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBrazilianPhone(e.target.value)
    setFormData({ ...formData, phone: formatted })
    if (phoneError) setPhoneError(null)
  }

  const handlePhoneBlur = () => {
    if (!formData.phone) return
    const result = validateBrazilianPhone(formData.phone)
    if (!result.valid) {
      setPhoneError('Número de telefone inválido')
    } else {
      setPhoneError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)
    setPhoneError(null)

    // Client-side phone validation
    const phoneResult = validateBrazilianPhone(formData.phone)
    if (!phoneResult.valid) {
      setPhoneError('Número de telefone inválido')
      setLoading(false)
      return
    }

    // Backend phone verification
    let phoneToUpdate = phoneResult.formatted!
    try {
      const verifyRes = await fetch('/api/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone }),
      })
      const verifyData = await verifyRes.json()

      if (!verifyData.valid) {
        const errorMsg = verifyData.error === 'Please use a mobile number'
          ? 'Por favor, use um número de celular'
          : 'Número de telefone inválido'
        setPhoneError(errorMsg)
        setLoading(false)
        return
      }

      if (verifyData.formatted) {
        phoneToUpdate = verifyData.formatted
      }
    } catch {
      // If API fails, proceed with client-side validated number
    }

    const fullName = `${formData.name} ${formData.surname}`.trim()

    if (leadId) {
      const supabase = createClient()
      const { error: updateError } = await supabase.from('leads').update({
        name: fullName,
        phone: phoneToUpdate,
      }).eq('id', leadId)

      if (updateError) {
        console.error('Lead update failed:', updateError.message)
        setError(true)
        setLoading(false)
        return
      }
    }

    setLoading(false)
    setSubmitted(true)

    // Defer all tracking to next frame so UI updates instantly (INP optimization)
    requestAnimationFrame(() => {
      setTimeout(() => {
        const eventId = generateEventId()
        const tracking = getTrackingData()

        pushLeadEvent({
          formType: 'followup-modal',
          leadSource: 'hero-inline-mobile',
          email,
          phone: phoneToUpdate,
          firstName: formData.name,
          eventId,
          trackingData: tracking,
        })

        trackFbq('track', 'Lead', {
          content_name: 'Followup Modal',
          content_category: 'Free Lesson',
          eventID: eventId,
        })

        tagClarityLead({ email, formType: 'followup-modal', leadSource: 'hero-inline-mobile' })
        window.clarity?.('set', 'form_step', 'followup_completed')
      }, 0)
    })

    setTimeout(() => {
      onSuccess()
    }, 1500)
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setFormData({ name: '', surname: '', phone: '' })
      setError(false)
      setPhoneError(null)
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
            className="relative w-full max-w-md bg-white p-8 shadow-2xl z-10 min-h-[480px]"
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
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-3 pr-10 border border-gray-200 text-primary-500 text-sm bg-gray-100 cursor-not-allowed opacity-70"
                    />
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
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
                      onChange={handlePhoneChange}
                      onBlur={handlePhoneBlur}
                      className={`w-full px-4 py-3 border text-primary-800 text-sm focus:outline-none transition-colors ${
                        phoneError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-primary-700'
                      }`}
                      placeholder="+55 (11) 99999-9999"
                      autoComplete="tel"
                      inputMode="tel"
                      data-clarity-label="followup-phone"
                    />
                    {phoneError && (
                      <p className="text-xs text-red-600 mt-1">{phoneError}</p>
                    )}
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
