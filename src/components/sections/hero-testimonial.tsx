import { useTranslations } from 'next-intl'

export function HeroTestimonial() {
  const t = useTranslations('heroTestimonial')

  return (
    <section className="py-6 md:py-8 bg-white" data-clarity-region="hero-testimonial">
      <div className="container-custom">
        <div className="max-w-xl mx-auto bg-gray-50 border border-gray-200 p-4 md:p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-300 to-primary-400 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{t('name').charAt(0)}</span>
            </div>

            <div className="min-w-0">
              <p className="text-sm text-primary-700 leading-relaxed italic">
                &ldquo;{t('text')}&rdquo;
              </p>
              <div className="mt-2 flex items-center gap-2">
                <p className="text-xs font-semibold text-primary-800">{t('name')}</p>
                <span className="text-xs text-primary-400">·</span>
                <p className="text-xs text-primary-500">{t('location')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
