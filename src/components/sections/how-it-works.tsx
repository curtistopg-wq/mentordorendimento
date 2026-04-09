import { ClipboardCheck, MessageCircle, TrendingUp } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: ClipboardCheck,
    title: 'Inscreva-se Grátis',
    description: 'Preencha o formulário e receba acesso imediato aos materiais iniciais.',
  },
  {
    number: '02',
    icon: MessageCircle,
    title: 'Receba os Materiais',
    description: 'Aulas, estratégias e suporte direto no seu WhatsApp e e-mail.',
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'Comece a Operar',
    description: 'Com mentoria ao vivo e uma comunidade de apoio para acelerar seus resultados.',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-16 md:py-20 bg-primary-900">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-display font-light text-white mb-3">
            Como Funciona
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
            Comece a operar em 3 passos simples
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="text-center">
                {/* Number + Icon */}
                <div className="relative inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-primary-700 mb-4 md:mb-6">
                  <Icon className="w-7 h-7 md:w-8 md:h-8 text-amber-400" strokeWidth={1.5} />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white">
                    {step.number}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-display font-semibold text-amber-400 mb-2">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>

                {/* Connector arrow (mobile only, not on last) */}
                {index < steps.length - 1 && (
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
