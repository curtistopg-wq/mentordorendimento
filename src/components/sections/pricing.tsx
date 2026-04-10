'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Copy, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useSignupModal } from '@/components/providers/signup-modal-provider'
import { trackFbq } from '@/components/analytics/meta-pixel-events'
import { trackWhatsAppClick, trackBankDetailsOpen, trackBankDetailsCopy } from '@/lib/tracking'

const planKeys = ['silver', 'gold', 'platinum'] as const
const planConfig = {
  silver: { price: 250, variant: 'light' as const, popular: false, featureCount: 3 },
  gold: { price: 500, variant: 'gray' as const, popular: true, featureCount: 9 },
  platinum: { price: 1000, variant: 'dark' as const, popular: false, featureCount: 15 },
}

const BANK_DETAILS = {
  bank: 'Banco do Brasil - 001',
  account: '41625-8',
  holder: 'ALLIANCE CAPITAL INTERNATIONAL',
  pixKey: '64984047000110',
  currency: 'BRL',
}

export function Pricing() {
  const t = useTranslations('pricing')
  const te = useTranslations('pricingExtra')
  const { open } = useSignupModal()
  const [showBankDetails, setShowBankDetails] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = async (value: string, field: string, planKey: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedField(field)
    trackBankDetailsCopy(planKey, field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-primary-700 to-primary-800">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-normal text-white mb-4">
            {t('title')}
          </h2>
          <p className="text-primary-300 text-lg">
            {t('subtitle')}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-accent/20 border border-accent/30 rounded-full">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-accent-light text-sm font-medium">{t('urgency')}</span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {planKeys.map((planKey, index) => {
            const config = planConfig[planKey]
            const features = Array.from({ length: config.featureCount }, (_, i) =>
              t(`plans.${planKey}.features.${i}`)
            )

            return (
              <motion.div
                key={planKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'relative rounded-lg overflow-hidden',
                  config.variant === 'light' && 'bg-white',
                  config.variant === 'gray' && 'bg-gray-100',
                  config.variant === 'dark' && 'bg-primary-900'
                )}
              >
                {/* Popular Ribbon */}
                {config.popular && (
                  <div className="absolute top-4 -right-8 rotate-45 bg-accent text-white text-xs font-bold px-10 py-1 shadow-lg">
                    {t('popular')}
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Name */}
                  <h3
                    className={cn(
                      'text-2xl font-display font-bold mb-4 text-center',
                      config.variant === 'dark' ? 'text-gold' : 'text-primary-800'
                    )}
                  >
                    {t(`plans.${planKey}.name`)}
                  </h3>

                  {/* Divider */}
                  <div className={cn(
                    'w-full h-px mb-6',
                    config.variant === 'dark' ? 'bg-primary-700' : 'bg-primary-200'
                  )} />

                  {/* Price */}
                  <div className="text-center mb-6">
                    <span className={cn(
                      'text-4xl md:text-5xl font-bold',
                      config.variant === 'dark' ? 'text-white' : 'text-primary-800'
                    )}>
                      ${config.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 min-h-[200px]">
                    {features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className={cn(
                          'w-5 h-5 flex-shrink-0 mt-0.5',
                          config.variant === 'dark' ? 'text-gold' : 'text-green-500'
                        )} />
                        <span className={cn(
                          'text-sm',
                          config.variant === 'dark' ? 'text-primary-300' : 'text-primary-600'
                        )}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => {
                      trackFbq('track', 'InitiateCheckout', {
                        content_name: planKey.charAt(0).toUpperCase() + planKey.slice(1),
                        value: config.price,
                        currency: 'USD',
                        content_type: 'product',
                        content_category: 'Trading Course',
                      })
                      open()
                    }}
                    data-clarity-label={`pricing-${planKey}-cta`}
                    className={cn(
                      'block w-full text-center py-3 px-6 font-semibold transition-all cursor-pointer',
                      config.variant === 'dark'
                        ? 'bg-gold hover:bg-yellow-500 text-primary-900 rounded-lg'
                        : 'bg-accent hover:bg-accent-dark text-white rounded-lg'
                    )}
                  >
                    {t('readMore')}
                  </button>

                  {/* Bank Transfer Button */}
                  <button
                    onClick={() => {
                      const isOpening = showBankDetails !== planKey
                      setShowBankDetails(isOpening ? planKey : null)
                      if (isOpening) trackBankDetailsOpen(planKey)
                    }}
                    data-clarity-label={`pricing-${planKey}-bank-transfer`}
                    className={cn(
                      'block w-full text-center py-2.5 mt-2 text-sm font-semibold transition-all cursor-pointer rounded-lg border',
                      config.variant === 'dark'
                        ? 'border-primary-600 text-primary-300 hover:text-white hover:border-primary-500'
                        : 'border-primary-200 text-primary-600 hover:text-primary-800 hover:border-primary-400'
                    )}
                  >
                    {t('bankTransferCta')}
                  </button>

                  {/* Bank Details Panel */}
                  <AnimatePresence>
                    {showBankDetails === planKey && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
                        className="overflow-hidden"
                      >
                        <div className={cn(
                          'mt-4 p-5 rounded-lg border',
                          config.variant === 'dark'
                            ? 'bg-primary-800 border-primary-600'
                            : 'bg-white border-primary-200 shadow-sm'
                        )}>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className={cn(
                              'text-sm font-bold uppercase tracking-wide',
                              config.variant === 'dark' ? 'text-gold' : 'text-primary-800'
                            )}>
                              {t('bankDetailsTitle')}
                            </h4>
                            <button
                              onClick={() => setShowBankDetails(null)}
                              className={cn(
                                'p-1 rounded transition-colors',
                                config.variant === 'dark' ? 'text-primary-400 hover:text-white' : 'text-primary-400 hover:text-primary-800'
                              )}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-3">
                            {[
                              { label: t('bankDetailsBank'), value: BANK_DETAILS.bank, key: 'bank' },
                              { label: t('bankDetailsAccount'), value: BANK_DETAILS.account, key: 'account' },
                              { label: t('bankDetailsHolder'), value: BANK_DETAILS.holder, key: 'holder' },
                              { label: t('bankDetailsPixKey'), value: BANK_DETAILS.pixKey, key: 'pix' },
                              { label: t('bankDetailsCurrency'), value: BANK_DETAILS.currency, key: 'currency' },
                            ].map(({ label, value, key }) => (
                              <div key={key} className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className={cn(
                                    'text-[10px] uppercase tracking-wider font-medium',
                                    config.variant === 'dark' ? 'text-primary-500' : 'text-primary-400'
                                  )}>
                                    {label}
                                  </p>
                                  <p className={cn(
                                    'text-xs font-medium break-all',
                                    config.variant === 'dark' ? 'text-primary-200' : 'text-primary-700'
                                  )}>
                                    {value}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleCopy(value, key, planKey)}
                                  className={cn(
                                    'flex-shrink-0 p-1.5 rounded transition-colors mt-2',
                                    config.variant === 'dark'
                                      ? 'text-primary-400 hover:text-white hover:bg-primary-700'
                                      : 'text-primary-400 hover:text-primary-700 hover:bg-primary-50'
                                  )}
                                  title="Copy"
                                >
                                  {copiedField === key
                                    ? <CheckCheck className="w-3.5 h-3.5 text-green-500" />
                                    : <Copy className="w-3.5 h-3.5" />
                                  }
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* QR Code */}
                          <div className="mt-4 pt-4 border-t border-dashed flex flex-col items-center gap-2"
                            style={{ borderColor: config.variant === 'dark' ? 'rgb(55 65 81)' : 'rgb(226 232 240)' }}
                          >
                            <p className={cn(
                              'text-[10px] uppercase tracking-wider font-medium',
                              config.variant === 'dark' ? 'text-primary-500' : 'text-primary-400'
                            )}>
                              Pix QR Code
                            </p>
                            <div className="bg-white p-2 rounded-lg">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src="/images/pix-qr-code.jpg"
                                alt="Pix QR Code"
                                width={200}
                                height={200}
                                className="w-[200px] h-[200px]"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            </div>
                          </div>

                          {/* Note */}
                          <p className={cn(
                            'mt-4 text-[11px] leading-relaxed text-center',
                            config.variant === 'dark' ? 'text-primary-400' : 'text-primary-500'
                          )}>
                            {t('bankDetailsNote')}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* WhatsApp alternative */}
                  <a
                    href={`https://wa.me/5511914134580?text=${encodeURIComponent(`Olá! Tenho interesse no plano ${t(`plans.${planKey}.name`)}. Pode me ajudar?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick(`pricing-${planKey}`)}
                    data-clarity-label={`pricing-${planKey}-whatsapp`}
                    className={cn(
                      'block w-full text-center py-2 mt-2 text-sm font-medium transition-colors',
                      config.variant === 'dark' ? 'text-primary-400 hover:text-white' : 'text-primary-500 hover:text-primary-800'
                    )}
                  >
                    {t('whatsappCta')}
                  </a>

                  {/* Payment methods + Guarantee */}
                  <div className={cn(
                    'mt-4 pt-4 border-t space-y-2',
                    config.variant === 'dark' ? 'border-primary-700' : 'border-gray-200'
                  )}>
                    <div className="flex items-center justify-center gap-3">
                      <span className={cn('text-[10px] uppercase tracking-wider font-medium', config.variant === 'dark' ? 'text-primary-500' : 'text-primary-400')}>
                        {te('paymentMethods')}
                      </span>
                      <div className="flex items-center gap-2">
                        {[te('pix'), te('boleto'), te('card')].map((method) => (
                          <span key={method} className={cn(
                            'text-[10px] px-2 py-0.5 rounded border font-medium',
                            config.variant === 'dark'
                              ? 'border-primary-600 text-primary-400'
                              : 'border-gray-300 text-primary-500'
                          )}>
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className={cn(
                      'text-[11px] text-center flex items-center justify-center gap-1',
                      config.variant === 'dark' ? 'text-primary-400' : 'text-primary-500'
                    )}>
                      {te('guarantee')}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
