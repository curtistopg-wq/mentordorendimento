import { useTranslations } from 'next-intl'

export function Guarantee() {
  const t = useTranslations('guarantee')

  return (
    <section id="guarantee" data-clarity-region="guarantee" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary-800 to-primary-900" />

      <div className="container-custom relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-light text-white mb-8 tracking-wide animate-on-scroll">
            {t('titleLine1')}
            <br />
            {t('titleLine2')}
          </h2>

          <p className="text-sm text-primary-200 leading-relaxed max-w-5xl mx-auto animate-on-scroll-delay-1">
            {t('disclaimer')}
          </p>
        </div>
      </div>
    </section>
  )
}
