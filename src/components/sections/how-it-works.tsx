import { ClipboardCheck, MessageCircle, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

const stepIcons = [ClipboardCheck, MessageCircle, TrendingUp]
const stepKeys = ['0', '1', '2'] as const

export function HowItWorks() {
  const t = useTranslations('howItWorks')

  return (
    <section id="como-funciona" className="py-16 md:py-20 bg-primary-900">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-serif font-normal text-white mb-3">
            {t('title')}
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {stepKeys.map((key, index) => {
            const Icon = stepIcons[index]
            return (
              <div key={key} className="text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-primary-700 mb-4 md:mb-6">
                  <Icon className="w-7 h-7 md:w-8 md:h-8 text-amber-400" strokeWidth={1.5} />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white">
                    {t(`steps.${key}.number`)}
                  </span>
                </div>

                <h3 className="text-lg font-display font-semibold text-amber-400 mb-2">
                  {t(`steps.${key}.title`)}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                  {t(`steps.${key}.description`)}
                </p>

                {index < stepKeys.length - 1 && (
                  <div className="md:hidden flex justify-center my-4">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
