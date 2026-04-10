'use client'

import { LazyMotion } from 'framer-motion'

const loadFeatures = () =>
  import('@/lib/framer-features').then((res) => res.default)

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  )
}
