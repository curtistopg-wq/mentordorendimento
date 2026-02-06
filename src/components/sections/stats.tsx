'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Clock, Eye, ArrowRightToLine, CalendarDays } from 'lucide-react'
import { useTranslations } from 'next-intl'

const statIcons = [Clock, Eye, ArrowRightToLine, CalendarDays]
const statValues = [10321, 7251, 5764, 9877]
const statKeys = ['completed', 'dedicated', 'multi', 'satisfied'] as const

function Counter({ value }: { value: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView) {
          setIsInView(true)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isInView])

  useEffect(() => {
    if (!isInView) return

    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isInView, value])

  return (
    <span ref={ref}>
      {count.toLocaleString()}
    </span>
  )
}

export function Stats() {
  const t = useTranslations('stats')

  return (
    <section className="py-20 bg-gray-100">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row items-center justify-center">
          {statKeys.map((key, index) => {
            const Icon = statIcons[index]
            const value = statValues[index]

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center"
              >
                {/* Vertical Divider (before each item except first) */}
                {index > 0 && (
                  <div className="hidden md:block w-px h-36 bg-gray-300 mx-10 lg:mx-14" />
                )}

                <div className="text-center py-6 md:py-0 px-6 lg:px-10">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-primary-700 mb-6">
                    <Icon className="w-9 h-9 text-primary-700" strokeWidth={1.5} />
                  </div>

                  {/* Number */}
                  <p className="text-4xl md:text-5xl font-light text-primary-700 mb-3">
                    <Counter value={value} />
                  </p>

                  {/* Label */}
                  <p className="text-sm text-primary-600">{t(`items.${key}.label`)}</p>
                  <p className="text-sm text-primary-600">{t(`items.${key}.sublabel`)}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
