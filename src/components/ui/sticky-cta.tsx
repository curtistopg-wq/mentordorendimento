'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { SignupModal } from './signup-modal'

export function StickyCTA() {
  const t = useTranslations('hero')
  const [visible, setVisible] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/95 backdrop-blur-sm border-t border-primary-200 safe-area-pb">
        <button
          onClick={() => setModalOpen(true)}
          data-clarity-label="sticky-cta"
          className="w-full py-3.5 bg-accent text-white font-bold text-sm hover:bg-accent-dark transition-colors"
        >
          {t('cta')}
        </button>
      </div>
      <SignupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
