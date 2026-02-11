'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'

const SignupModal = dynamic(
  () => import('@/components/ui/signup-modal').then(m => ({ default: m.SignupModal })),
  { ssr: false }
)

interface SignupModalContextValue {
  open: () => void
}

const SignupModalContext = createContext<SignupModalContextValue>({ open: () => {} })

export function useSignupModal() {
  return useContext(SignupModalContext)
}

export function SignupModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])

  return (
    <SignupModalContext.Provider value={{ open }}>
      {children}
      <SignupModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </SignupModalContext.Provider>
  )
}
