'use client'

import { useEffect } from 'react'

export function TrackingCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)

      // fbclid → _fbc cookie (90 days)
      const fbclid = params.get('fbclid')
      if (fbclid && !document.cookie.match(/(^| )_fbc=/)) {
        const fbc = 'fb.1.' + Date.now() + '.' + fbclid
        const d = new Date()
        d.setTime(d.getTime() + 90 * 24 * 60 * 60 * 1000)
        const domain = window.location.hostname.replace(/^www\./, '')
        document.cookie =
          '_fbc=' + fbc + '; expires=' + d.toUTCString() + '; path=/; domain=.' + domain + '; SameSite=Lax'
      }

      // UTM persistence → first-party cookies (30d) + sessionStorage
      const d = new Date()
      d.setTime(d.getTime() + 30 * 24 * 60 * 60 * 1000)
      const ex = '; expires=' + d.toUTCString() + '; path=/; SameSite=Lax'
      const dm = '; domain=.' + window.location.hostname.replace(/^www\./, '')

      ;['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'].forEach((k) => {
        const v = params.get(k)
        if (v) {
          document.cookie = 'mdr_' + k + '=' + encodeURIComponent(v) + ex + dm
          sessionStorage.setItem('mdr_' + k, v)
        }
      })

      if (!document.cookie.match('mdr_landing=')) {
        document.cookie = 'mdr_landing=' + encodeURIComponent(window.location.href) + ex + dm
      }
      if (!document.cookie.match('mdr_referrer=')) {
        document.cookie = 'mdr_referrer=' + encodeURIComponent(document.referrer) + ex + dm
      }
      if (!sessionStorage.getItem('mdr_landing')) sessionStorage.setItem('mdr_landing', window.location.href)
      if (!sessionStorage.getItem('mdr_referrer')) sessionStorage.setItem('mdr_referrer', document.referrer)
    } catch {
      // Silent fail — tracking should never break the page
    }
  }, [])

  return null
}
