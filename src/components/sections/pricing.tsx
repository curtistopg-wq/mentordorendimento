'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { SignupModal } from '@/components/ui/signup-modal'

const planKeys = ['silver', 'gold', 'platinum'] as const
const planConfig = {
  silver: { price: 250, variant: 'light' as const, popular: false, featureCount: 3 },
  gold: { price: 500, variant: 'gray' as const, popular: true, featureCount: 9 },
  platinum: { price: 1000, variant: 'dark' as const, popular: false, featureCount: 15 },
}

export function Pricing() {
  const t = useTranslations('pricing')
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <section id="pricing" className="py-20 bg-gradient-to-b from-primary-700 to-primary-800">
        <div className="container-custom">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
              {t('title')}
            </h2>
            <p className="text-primary-300 text-lg">
              {t('subtitle')}
            </p>
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
                      onClick={() => setModalOpen(true)}
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
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <SignupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
