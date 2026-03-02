import { Hero } from '@/components/sections/hero'
import { TrustStrip } from '@/components/sections/trust-strip'
import { Features } from '@/components/sections/features'
import dynamic from 'next/dynamic'

const Stats = dynamic(() => import('@/components/sections/stats').then(m => ({ default: m.Stats })))
const Testimonials = dynamic(() => import('@/components/sections/testimonials').then(m => ({ default: m.Testimonials })))
const Pricing = dynamic(() => import('@/components/sections/pricing').then(m => ({ default: m.Pricing })))
const CoursesAccordion = dynamic(() => import('@/components/sections/courses-accordion').then(m => ({ default: m.CoursesAccordion })))
const CTA = dynamic(() => import('@/components/sections/cta').then(m => ({ default: m.CTA })))

export default function Home() {
  return (
    <main>
      <Hero />
      <TrustStrip />
      <Stats />
      <Features />
      <Testimonials />
      <Pricing />
      <CoursesAccordion />
      <CTA />
    </main>
  )
}
