'use client'

import { useState, useCallback, useRef } from 'react'
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface UsePhoneOtpReturn {
  sendOtp: (phoneE164: string) => Promise<boolean>
  verifyOtp: (code: string) => Promise<boolean>
  otpSent: boolean
  otpVerified: boolean
  otpLoading: boolean
  otpError: string | null
  resetOtp: () => void
}

export function usePhoneOtp(): UsePhoneOtpReturn {
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)
  const confirmationRef = useRef<ConfirmationResult | null>(null)
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null)

  const getRecaptcha = useCallback(() => {
    if (recaptchaRef.current) return recaptchaRef.current

    // Create invisible reCAPTCHA container if not exists
    let container = document.getElementById('recaptcha-container')
    if (!container) {
      container = document.createElement('div')
      container.id = 'recaptcha-container'
      document.body.appendChild(container)
    }

    recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
    })

    return recaptchaRef.current
  }, [])

  const sendOtp = useCallback(async (phoneE164: string): Promise<boolean> => {
    setOtpLoading(true)
    setOtpError(null)

    try {
      const recaptcha = getRecaptcha()
      const confirmation = await signInWithPhoneNumber(auth, phoneE164, recaptcha)
      confirmationRef.current = confirmation
      setOtpSent(true)
      setOtpLoading(false)
      return true
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      console.error('OTP send error:', error)

      // Reset reCAPTCHA on error so it can be retried
      if (recaptchaRef.current) {
        try { recaptchaRef.current.clear() } catch { /* ignore */ }
        recaptchaRef.current = null
      }

      if (error.code === 'auth/too-many-requests') {
        setOtpError('Muitas tentativas. Aguarde alguns minutos.')
      } else if (error.code === 'auth/invalid-phone-number') {
        setOtpError('Número de telefone inválido.')
      } else if (error.code === 'auth/quota-exceeded') {
        setOtpError('Limite de SMS atingido. Tente novamente amanhã.')
      } else {
        setOtpError('Erro ao enviar SMS. Tente novamente.')
      }

      setOtpLoading(false)
      return false
    }
  }, [getRecaptcha])

  const verifyOtp = useCallback(async (code: string): Promise<boolean> => {
    if (!confirmationRef.current) {
      setOtpError('Envie o código primeiro.')
      return false
    }

    setOtpLoading(true)
    setOtpError(null)

    try {
      await confirmationRef.current.confirm(code)
      setOtpVerified(true)
      setOtpLoading(false)

      // Sign out immediately - we only need verification, not auth session
      await auth.signOut()

      return true
    } catch (err: unknown) {
      const error = err as { code?: string }
      console.error('OTP verify error:', error)

      if (error.code === 'auth/invalid-verification-code') {
        setOtpError('Código incorreto. Verifique e tente novamente.')
      } else if (error.code === 'auth/code-expired') {
        setOtpError('Código expirado. Solicite um novo.')
      } else {
        setOtpError('Erro na verificação. Tente novamente.')
      }

      setOtpLoading(false)
      return false
    }
  }, [])

  const resetOtp = useCallback(() => {
    setOtpSent(false)
    setOtpVerified(false)
    setOtpLoading(false)
    setOtpError(null)
    confirmationRef.current = null
    if (recaptchaRef.current) {
      try { recaptchaRef.current.clear() } catch { /* ignore */ }
      recaptchaRef.current = null
    }
  }, [])

  return {
    sendOtp,
    verifyOtp,
    otpSent,
    otpVerified,
    otpLoading,
    otpError,
    resetOtp,
  }
}
