import { Users, ThumbsUp, Star, Headphones } from 'lucide-react'

const stats = [
  { icon: Users, value: '9,877', label: 'Alunos Ativos', sublabel: '' },
  { icon: ThumbsUp, value: '97%', label: 'Taxa de', sublabel: 'Satisfação' },
  { icon: Star, value: '4.7/5', label: 'Avaliação', sublabel: 'Média' },
  { icon: Headphones, value: '24/7', label: 'Suporte', sublabel: 'Disponível' },
]

export function Stats() {
  return (
    <section id="stats" data-clarity-region="stats" className="py-20 bg-gray-100">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:flex md:flex-row items-center justify-center gap-6 md:gap-0">
          {stats.map((stat, index) => {
            const Icon = stat.icon

            return (
              <div
                key={index}
                className="flex items-center animate-on-scroll"
              >
                {index > 0 && (
                  <div className="hidden md:block w-px h-36 bg-gray-300 mx-10 lg:mx-14" />
                )}

                <div className="text-center py-2 md:py-0 px-2 md:px-6 lg:px-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-full border-2 border-primary-700 mb-3 md:mb-6">
                    <Icon className="w-6 h-6 md:w-9 md:h-9 text-primary-700" strokeWidth={1.5} />
                  </div>

                  <p className="text-2xl md:text-5xl font-light text-primary-700 mb-1 md:mb-3">
                    {stat.value}
                  </p>

                  <p className="text-xs md:text-sm text-primary-600">{stat.label}</p>
                  {stat.sublabel && <p className="text-xs md:text-sm text-primary-600">{stat.sublabel}</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
