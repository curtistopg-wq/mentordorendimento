import { FolderOpen, User, MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

const featureIcons = [FolderOpen, User, MessageCircle]
const featureKeys = ['education', 'innovation', 'community'] as const

export function Features() {
  const t = useTranslations('features')

  return (
    <section id="features" className="relative py-20">
      <div className="absolute inset-0 z-0 bg-primary-900" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-on-scroll">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-light text-white mb-6 leading-tight">
            {t('titleLine1')}
            <br />
            {t('titleLine2')}
            <br />
            {t('titleLine3')}
          </h2>
          <p className="text-gray-300 text-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {featureKeys.map((key, index) => {
            const Icon = featureIcons[index]
            const delayClass = index === 0 ? 'animate-on-scroll' : index === 1 ? 'animate-on-scroll-delay-1' : 'animate-on-scroll-delay-2'
            return (
              <div
                key={key}
                className={`flex items-start gap-4 ${delayClass}`}
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary-800 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-gray-300" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-semibold text-amber-400 mb-1">
                    {t(`items.${key}.title`)}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {t(`items.${key}.description`)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
