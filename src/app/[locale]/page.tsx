import { Hero } from '@/components/sections/hero'
import { TrustStrip } from '@/components/sections/trust-strip'
import { Features } from '@/components/sections/features'
import { ContentPanel } from '@/components/sections/content-panel'
import dynamic from 'next/dynamic'

const TestimonialCarousel = dynamic(() => import('@/components/sections/testimonial-carousel').then(m => ({ default: m.TestimonialCarousel })))
const HowItWorks = dynamic(() => import('@/components/sections/how-it-works').then(m => ({ default: m.HowItWorks })))
const Stats = dynamic(() => import('@/components/sections/stats').then(m => ({ default: m.Stats })))
const MidCTA = dynamic(() => import('@/components/sections/mid-cta').then(m => ({ default: m.MidCTA })))
const Pricing = dynamic(() => import('@/components/sections/pricing').then(m => ({ default: m.Pricing })))
const FAQ = dynamic(() => import('@/components/sections/faq').then(m => ({ default: m.FAQ })))
const CTA = dynamic(() => import('@/components/sections/cta').then(m => ({ default: m.CTA })))

export default function Home() {
  return (
    <main>
      <Hero />
      <TestimonialCarousel />
      <TrustStrip />
      <HowItWorks />
      <ContentPanel />
      <Features />
      <Stats />
      <MidCTA />
      <Pricing />
      <FAQ />
      <CTA />
    </main>
  )
}
