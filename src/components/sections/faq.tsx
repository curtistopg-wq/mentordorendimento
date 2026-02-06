'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

const FAQ_COUNT = 6

function AccordionItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <div className="border-b border-primary-200 dark:border-primary-700">
      <button
        onClick={onClick}
        className="w-full py-5 flex items-center justify-between text-left"
      >
        <span className="text-lg font-semibold text-primary-800 dark:text-white pr-4">
          {question}
        </span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-accent flex-shrink-0 transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-primary-600 dark:text-primary-300 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const t = useTranslations('faq')

  return (
    <section id="faq" className="section-padding bg-white dark:bg-primary-900">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative hidden lg:block"
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-accent/20 to-primary-200 dark:from-accent/10 dark:to-primary-800">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <HelpCircle className="w-24 h-24 text-accent mx-auto mb-4 opacity-50" />
                  <p className="text-primary-500 dark:text-primary-400">
                    {t('illustration')}
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Element */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-6 -right-6 bg-accent text-white rounded-xl p-6 shadow-lg"
            >
              <p className="text-3xl font-bold">{t('supportHours')}</p>
              <p className="text-sm opacity-90">{t('supportText')}</p>
            </motion.div>
          </motion.div>

          {/* FAQ Side */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <span className="text-accent font-medium text-sm uppercase tracking-wider">
                {t('label')}
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-800 dark:text-white mt-3 mb-4">
                {t('title')}
              </h2>
              <p className="text-primary-600 dark:text-primary-300">
                {t('subtitle')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              {Array.from({ length: FAQ_COUNT }, (_, index) => (
                <AccordionItem
                  key={index}
                  question={t(`items.${index}.question`)}
                  answer={t(`items.${index}.answer`)}
                  isOpen={openIndex === index}
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
