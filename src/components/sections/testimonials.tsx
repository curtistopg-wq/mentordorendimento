'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { useTranslations } from 'next-intl'

const testimonialKeys = ['lucas', 'mariana', 'gabriel', 'larissa'] as const
const testimonialImages = [
  '/images/testimonial-1.jpg',
  '/images/testimonial-2.jpg',
  '/images/testimonial-3.jpg',
  '/images/testimonial-4.jpg',
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function Testimonials() {
  const t = useTranslations('testimonials')

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-800 mb-4">
            {t('title')}
          </h2>
          <p className="text-primary-600">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {testimonialKeys.map((key, index) => {
            const name = t(`items.${key}.name`)
            return (
              <motion.div
                key={key}
                variants={item}
                className="bg-white border border-gray-200 rounded-lg p-8 relative"
              >
                {/* Quote Icon */}
                <div className="mb-6">
                  <Quote className="w-10 h-10 text-primary-600 fill-primary-600" />
                </div>

                {/* Text */}
                <p className="text-primary-700 mb-8 leading-relaxed italic">
                  &ldquo;{t(`items.${key}.text`)}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center overflow-hidden"
                    style={{
                      backgroundImage: `url(${testimonialImages[index]})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {/* Fallback initial */}
                    <span className="text-primary-600 font-bold text-lg">
                      {name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-primary-800">
                      {name}
                    </p>
                    <p className="text-sm text-primary-500">
                      {t(`items.${key}.location`)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
