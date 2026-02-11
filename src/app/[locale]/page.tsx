import { Hero } from '@/components/sections/hero'
import { Features } from '@/components/sections/features'
import dynamic from 'next/dynamic'

const Stats = dynamic(() => import('@/components/sections/stats').then(m => ({ default: m.Stats })))
const Testimonials = dynamic(() => import('@/components/sections/testimonials').then(m => ({ default: m.Testimonials })))
const Platform = dynamic(() => import('@/components/sections/platform').then(m => ({ default: m.Platform })))
const Pricing = dynamic(() => import('@/components/sections/pricing').then(m => ({ default: m.Pricing })))
const Guarantee = dynamic(() => import('@/components/sections/guarantee').then(m => ({ default: m.Guarantee })))
const CoursesAccordion = dynamic(() => import('@/components/sections/courses-accordion').then(m => ({ default: m.CoursesAccordion })))
const CTA = dynamic(() => import('@/components/sections/cta').then(m => ({ default: m.CTA })))

export default function Home() {
  return (
    <main>
      <Hero />
      <Stats />
      <Features />
      <Testimonials />
      <Platform />
      <Pricing />
      <Guarantee />
      <CoursesAccordion />
      <CTA />
    </main>
  )
}
