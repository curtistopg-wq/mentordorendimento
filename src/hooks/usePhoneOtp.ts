'use client'

import { useState, useCallback, useRef } from 'react'

interface UsePhoneOtpReturn {
  sendOtp: (email: string) => Promise<boolean>
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

  // Store token and timestamp from send-otp response for verification
  const tokenRef = useRef<string>('')
  const timestampRef = useRef<number>(0)
  const emailRef = useRef<string>('')

  const sendOtp = useCallback(async (email: string): Promise<boolean> => {
    setOtpLoading(true)
    setOtpError(null)
    emailRef.current = email

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!data.success) {
        setOtpError(data.error || 'Erro ao enviar código. Tente novamente.')
        setOtpLoading(false)
        return false
      }

      tokenRef.current = data.token
      timestampRef.current = data.timestamp
      setOtpSent(true)
      setOtpLoading(false)
      return true
    } catch (err) {
      console.error('Send OTP error:', err)
      setOtpError('Erro ao enviar código. Tente novamente.')
      setOtpLoading(false)
      return false
    }
  }, [])

  const verifyOtp = useCallback(async (code: string): Promise<boolean> => {
    setOtpLoading(true)
    setOtpError(null)

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailRef.current,
          code,
          token: tokenRef.current,
          timestamp: timestampRef.current,
        }),
      })
      const data = await res.json()

      if (data.verified) {
        setOtpVerified(true)
        setOtpLoading(false)
        return true
      }

      setOtpError(data.error || 'Código incorreto. Verifique e tente novamente.')
      setOtpLoading(false)
      return false
    } catch (err) {
      console.error('Verify OTP error:', err)
      setOtpError('Erro na verificação. Tente novamente.')
      setOtpLoading(false)
      return false
    }
  }, [])

  const resetOtp = useCallback(() => {
    setOtpSent(false)
    setOtpVerified(false)
    setOtpLoading(false)
    setOtpError(null)
    tokenRef.current = ''
    timestampRef.current = 0
    emailRef.current = ''
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
