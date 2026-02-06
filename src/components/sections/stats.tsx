'use client'

import { motion } from 'framer-motion'
import { Clock, Eye, ArrowRightToLine, CalendarDays } from 'lucide-react'
import { useTranslations } from 'next-intl'

const statIcons = [Clock, Eye, ArrowRightToLine, CalendarDays]
const statValues = ['10,321', '7,251', '5,764', '9,877']
const statKeys = ['completed', 'dedicated', 'multi', 'satisfied'] as const

export function Stats() {
  const t = useTranslations('stats')

  return (
    <section id="stats" data-clarity-region="stats" className="py-20 bg-gray-100">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:flex md:flex-row items-center justify-center gap-6 md:gap-0">
          {statKeys.map((key, index) => {
            const Icon = statIcons[index]

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center"
              >
                {index > 0 && (
                  <div className="hidden md:block w-px h-36 bg-gray-300 mx-10 lg:mx-14" />
                )}

                <div className="text-center py-2 md:py-0 px-2 md:px-6 lg:px-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-full border-2 border-primary-700 mb-3 md:mb-6">
                    <Icon className="w-6 h-6 md:w-9 md:h-9 text-primary-700" strokeWidth={1.5} />
                  </div>

                  <p className="text-2xl md:text-5xl font-light text-primary-700 mb-1 md:mb-3">
                    {statValues[index]}
                  </p>

                  <p className="text-xs md:text-sm text-primary-600">{t(`items.${key}.label`)}</p>
                  <p className="text-xs md:text-sm text-primary-600">{t(`items.${key}.sublabel`)}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
