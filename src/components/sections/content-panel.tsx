'use client'

import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSignupModal } from '@/components/providers/signup-modal-provider'

const PANELS = [
  {
    key: 'red',
    gradient: 'from-red-500 via-red-700 to-red-950',
  },
  {
    key: 'navy',
    gradient: 'from-blue-500 via-blue-900 to-[#0a1628]',
  },
  {
    key: 'orange',
    gradient: 'from-orange-400 via-orange-700 to-[#4a1a00]',
  },
] as const

export function ContentPanel() {
  const t = useTranslations('contentPanel')
  const { open } = useSignupModal()

  return (
    <section id="content-panel" className="py-20 bg-[#FAFAF5] section-separator">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          {PANELS.map((panel) => (
            <div key={panel.key}>
              <div className={`relative min-h-[300px] md:min-h-[450px] mx-4 md:mx-0 rounded-2xl bg-gradient-to-br ${panel.gradient} overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12),0_20px_60px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.08)]`}>
                <div className="absolute inset-0 backdrop-blur-xl bg-white/10" />
                <div className="relative z-10 flex flex-col md:flex-row md:justify-between h-full min-h-[300px] md:min-h-[450px] px-8 md:px-14 py-8 md:py-12">
                  {/* Headline - left, vertically centered */}
                  <div className="flex items-center">
                    <div>
                      <p className="text-white font-display text-3xl md:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] [text-shadow:0_1px_0_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.2)]">
                        {t(`${panel.key}.line1`)}
                      </p>
                      <p className="text-white font-display text-3xl md:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] [text-shadow:0_1px_0_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.2)]">
                        {t(`${panel.key}.line2`)}
                      </p>
                      <p className="text-white font-display text-3xl md:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] [text-shadow:0_1px_0_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.2)]">
                        {t(`${panel.key}.line3`)}
                      </p>
                    </div>
                  </div>

                  {/* Description - top right */}
                  <div className="mt-6 md:mt-0 max-w-xs md:max-w-sm md:text-right">
                    <p className="text-white/80 text-base md:text-lg leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.25)]">
                      {t(`${panel.key}.description`)}
                    </p>
                  </div>
                </div>

                {/* CTA - desktop: inside panel bottom right */}
                <div className="hidden md:block absolute bottom-10 right-14 z-10">
                  <button
                    onClick={open}
                    className="group inline-flex items-center gap-2 text-white font-display font-semibold text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] [text-shadow:0_1px_0_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.2)] transition-opacity hover:opacity-80"
                  >
                    {t(`${panel.key}.cta`)}
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
                  </button>
                </div>
              </div>

              {/* CTA - mobile: below panel, black text */}
              <div className="md:hidden flex justify-center mt-6 mx-4">
                <button
                  onClick={open}
                  className="group inline-flex items-center gap-2 text-primary-800 font-display font-semibold text-base transition-opacity hover:opacity-70"
                >
                  {t(`${panel.key}.cta`)}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
