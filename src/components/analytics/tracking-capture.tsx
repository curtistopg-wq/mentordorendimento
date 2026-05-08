'use client'

import { useEffect } from 'react'

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : ''
}

export function TrackingCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const domain = window.location.hostname.replace(/^www\./, '')

      // fbclid → _fbc cookie (90 days)
      const fbclid = params.get('fbclid')
      if (fbclid && !getCookie('_fbc')) {
        const fbc = 'fb.1.' + Date.now() + '.' + fbclid
        const d = new Date()
        d.setTime(d.getTime() + 90 * 24 * 60 * 60 * 1000)
        document.cookie =
          '_fbc=' + fbc + '; expires=' + d.toUTCString() + '; path=/; domain=.' + domain + '; SameSite=Lax'
      }

      // UTM persistence → first-party cookies (30d) + sessionStorage
      const d = new Date()
      d.setTime(d.getTime() + 30 * 24 * 60 * 60 * 1000)
      const ex = '; expires=' + d.toUTCString() + '; path=/; SameSite=Lax'
      const dm = '; domain=.' + domain

      ;['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'].forEach((k) => {
        const v = params.get(k)
        if (v) {
          document.cookie = 'mdr_' + k + '=' + encodeURIComponent(v) + ex + dm
          sessionStorage.setItem('mdr_' + k, v)
        }
      })

      if (!getCookie('mdr_landing')) {
        document.cookie = 'mdr_landing=' + encodeURIComponent(window.location.href) + ex + dm
      }
      if (!getCookie('mdr_referrer')) {
        document.cookie = 'mdr_referrer=' + encodeURIComponent(document.referrer) + ex + dm
      }
      if (!sessionStorage.getItem('mdr_landing')) sessionStorage.setItem('mdr_landing', window.location.href)
      if (!sessionStorage.getItem('mdr_referrer')) sessionStorage.setItem('mdr_referrer', document.referrer)
    } catch {
      // Silent fail — tracking should never break the page
    }

    // Deferred: wait for Meta Pixel to load, then capture _fbp and send PageView to CAPI
    // This ensures _fbp cookie is available (pixel sets it async)
    let attempts = 0
    const maxAttempts = 20 // 20 x 500ms = 10 seconds max
    const pollFbp = setInterval(() => {
      attempts++
      const fbp = getCookie('_fbp')
      const pvEventId = (window as unknown as Record<string, unknown>).__mdrPageViewEventId as string | undefined

      if ((fbp && pvEventId) || attempts >= maxAttempts) {
        clearInterval(pollFbp)

        // Save _fbp as backup cookie (in case pixel cookie scope differs)
        if (fbp && !getCookie('mdr_fbp')) {
          const d = new Date()
          d.setTime(d.getTime() + 90 * 24 * 60 * 60 * 1000)
          const domain = window.location.hostname.replace(/^www\./, '')
          document.cookie = 'mdr_fbp=' + fbp + '; expires=' + d.toUTCString() + '; path=/; domain=.' + domain + '; SameSite=Lax'
        }

        // Send PageView to CAPI with same eventID for dedup
        if (pvEventId) {
          const fbc = getCookie('_fbc')
          fetch('/api/capi/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_name: 'PageView',
              event_id: pvEventId,
              fbc: fbc || '',
              fbp: fbp || '',
              source_url: window.location.href,
              user_agent: navigator.userAgent,
            }),
            keepalive: true,
          }).catch(() => {})
        }
      }
    }, 500)

    return () => clearInterval(pollFbp)
  }, [])

  return null
}
