'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface TestimonialItem {
  key: string
  text: string
  name: string
  location: string
  gradientClass: string
}

const TESTIMONIAL_KEYS = ['lucas', 'mariana', 'gabriel', 'larissa'] as const

const GRADIENTS = [
  'from-primary-300 to-primary-400',
  'from-primary-300 to-primary-400',
  'from-accent to-accent-dark',
  'from-primary-400 to-primary-500',
  'from-primary-200 to-primary-300',
]

const SWIPE_THRESHOLD = 50

function TestimonialCard({ item }: { item: TestimonialItem }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 flex-1 min-w-0">
      <div className="mb-4">
        <Quote className="w-8 h-8 text-primary-600 fill-primary-600" />
      </div>
      <p className="text-primary-700 mb-6 leading-relaxed italic text-sm md:text-base">
        &ldquo;{item.text}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0',
            item.gradientClass
          )}
        >
          <span className="text-white font-bold text-sm md:text-base">
            {item.name.charAt(0)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-primary-800 text-sm">{item.name}</p>
          <p className="text-xs text-primary-500">{item.location}</p>
        </div>
      </div>
    </div>
  )
}

export function TestimonialCarousel() {
  const tHero = useTranslations('heroTestimonial')
  const tTest = useTranslations('testimonials')
  const prefersReducedMotion = useReducedMotion()

  const items: TestimonialItem[] = [
    {
      key: 'hero',
      text: tHero('text'),
      name: tHero('name'),
      location: tHero('location'),
      gradientClass: GRADIENTS[0],
    },
    ...TESTIMONIAL_KEYS.map((k, i) => ({
      key: k,
      text: tTest(`items.${k}.text`),
      name: tTest(`items.${k}.name`),
      location: tTest(`items.${k}.location`),
      gradientClass: GRADIENTS[i + 1],
    })),
  ]

  const [itemsPerPage, setItemsPerPage] = useState(1)
  const [currentPage, setCurrentPage] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchDelta, setTouchDelta] = useState(0)

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setItemsPerPage(e.matches ? 2 : 1)
    }
    handler(mql)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const pages: TestimonialItem[][] = []
  for (let i = 0; i < items.length; i += itemsPerPage) {
    pages.push(items.slice(i, i + itemsPerPage))
  }
  const totalPages = pages.length

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, Math.max(0, totalPages - 1)))
  }, [totalPages])

  const goToPrev = useCallback(() => {
    setCurrentPage(p => Math.max(0, p - 1))
  }, [])

  const goToNext = useCallback(() => {
    setCurrentPage(p => Math.min(totalPages - 1, p + 1))
  }, [totalPages])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
    setTouchDelta(0)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX === null) return
    setTouchDelta(e.touches[0].clientX - touchStartX)
  }, [touchStartX])

  const handleTouchEnd = useCallback(() => {
    if (touchDelta > SWIPE_THRESHOLD && currentPage > 0) {
      setCurrentPage(p => p - 1)
    } else if (touchDelta < -SWIPE_THRESHOLD && currentPage < totalPages - 1) {
      setCurrentPage(p => p + 1)
    }
    setTouchStartX(null)
    setTouchDelta(0)
  }, [touchDelta, currentPage, totalPages])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goToPrev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      goToNext()
    }
  }, [goToPrev, goToNext])

  const slideTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 300, damping: 30 }

  return (
    <section className="py-6 md:py-8 bg-[#FAFAF5] section-separator" data-clarity-region="testimonial-carousel">
      <div className="container-custom">
        <div
          className="max-w-5xl mx-auto animate-on-scroll"
          role="region"
          aria-roledescription="carousel"
          aria-label={tTest('title')}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {/* Carousel track */}
          <div className="overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: `-${currentPage * 100}%` }}
              transition={slideTransition}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {pages.map((pageItems, pageIndex) => (
                <div
                  key={pageIndex}
                  className="flex-shrink-0 w-full flex gap-4"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${pageIndex + 1} of ${totalPages}`}
                >
                  {pageItems.map(item => (
                    <TestimonialCard key={item.key} item={item} />
                  ))}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 mt-4">
            {/* Prev arrow - desktop only */}
            <button
              onClick={goToPrev}
              disabled={currentPage === 0}
              aria-label="Previous testimonials"
              className={cn(
                'hidden md:flex w-8 h-8 items-center justify-center rounded-full border border-gray-300 transition-colors',
                currentPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'
              )}
            >
              <ChevronLeft className="w-4 h-4 text-primary-700" />
            </button>

            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={currentPage === i ? 'true' : undefined}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    currentPage === i
                      ? 'bg-primary-700 w-4'
                      : 'bg-primary-300 hover:bg-primary-400 w-2'
                  )}
                />
              ))}
            </div>

            {/* Next arrow - desktop only */}
            <button
              onClick={goToNext}
              disabled={currentPage === totalPages - 1}
              aria-label="Next testimonials"
              className={cn(
                'hidden md:flex w-8 h-8 items-center justify-center rounded-full border border-gray-300 transition-colors',
                currentPage === totalPages - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'
              )}
            >
              <ChevronRight className="w-4 h-4 text-primary-700" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
