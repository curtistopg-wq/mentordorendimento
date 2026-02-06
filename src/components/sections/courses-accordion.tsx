'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { useTranslations } from 'next-intl'

const accordionKeys = ['everyLevel', 'experts', 'moreThan'] as const

export function CoursesAccordion() {
  const t = useTranslations('courses')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="courses" data-clarity-region="courses" className="py-0 bg-white">
      <div className="flex flex-col lg:flex-row">
        {/* Left - Image */}
        <div className="lg:w-1/2">
          <div
            className="h-64 lg:h-full min-h-[400px] lg:min-h-[500px]"
            style={{
              backgroundImage: 'url(/images/courses-image.webp)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>

        {/* Right - Accordion */}
        <div className="lg:w-1/2 bg-primary-700 p-8 lg:p-12 flex items-center">
          <div className="w-full">
            {accordionKeys.map((key, index) => (
              <div key={key} className="border-b border-primary-600 last:border-b-0">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full py-6 flex items-center justify-between text-left group"
                >
                  <h3 className="text-xl md:text-2xl font-display font-light text-white pr-4">
                    {t(`items.${key}.title`)}
                  </h3>
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    {openIndex === index ? (
                      <Minus className="w-6 h-6 text-white" />
                    ) : (
                      <Plus className="w-6 h-6 text-white" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-primary-300 leading-relaxed">
                        {t(`items.${key}.content`)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
