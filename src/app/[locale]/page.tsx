import { Hero } from '@/components/sections/hero'
import { Features } from '@/components/sections/features'
import { Platform } from '@/components/sections/platform'
import { Pricing } from '@/components/sections/pricing'
import { Guarantee } from '@/components/sections/guarantee'
import { Stats } from '@/components/sections/stats'
import { CoursesAccordion } from '@/components/sections/courses-accordion'
import { Testimonials } from '@/components/sections/testimonials'
import { CTA } from '@/components/sections/cta'

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <Platform />
      <Pricing />
      <Guarantee />
      <Stats />
      <CoursesAccordion />
      <Testimonials />
      <CTA />
    </main>
  )
}
