'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void
  }
}

function trackFbq(...args: unknown[]) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq(...args)
  }
}

export { trackFbq }

export function MetaPixelEvents() {
  useEffect(() => {
    console.log('Meta Pixel Complete Events v2.0 loaded')

    // 1. Scroll Depth Tracking (25%, 50%, 75%, 100%)
    const scrollMarks: Record<number, boolean> = { 25: false, 50: false, 75: false, 100: false }

    function handleScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      if (docHeight <= 0) return
      const scrollPercent = Math.round((scrollTop / docHeight) * 100)

      if (scrollPercent >= 25 && !scrollMarks[25]) {
        scrollMarks[25] = true
        trackFbq('trackCustom', 'ScrollDepth', { depth: '25%' })
      }
      if (scrollPercent >= 50 && !scrollMarks[50]) {
        scrollMarks[50] = true
        trackFbq('trackCustom', 'ScrollDepth', { depth: '50%' })
      }
      if (scrollPercent >= 75 && !scrollMarks[75]) {
        scrollMarks[75] = true
        trackFbq('trackCustom', 'ScrollDepth', { depth: '75%' })
      }
      if (scrollPercent >= 100 && !scrollMarks[100]) {
        scrollMarks[100] = true
        trackFbq('trackCustom', 'ScrollDepth', { depth: '100%' })
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // 2. Time on Page Tracking (30s, 60s, 120s, 300s)
    const timers = [
      setTimeout(() => trackFbq('trackCustom', 'TimeOnPage', { duration: '30s' }), 30000),
      setTimeout(() => trackFbq('trackCustom', 'TimeOnPage', { duration: '60s' }), 60000),
      setTimeout(() => trackFbq('trackCustom', 'TimeOnPage', { duration: '120s' }), 120000),
      setTimeout(() => trackFbq('trackCustom', 'TimeOnPage', { duration: '300s' }), 300000),
    ]

    // 3. Pricing Section Visibility (ViewContent)
    let pricingTracked = false
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !pricingTracked) {
            pricingTracked = true
            trackFbq('track', 'ViewContent', {
              content_name: 'Pricing Section',
              content_category: 'Pacotes Premium',
            })
          }
        })
      },
      { threshold: 0.5 }
    )

    const pricingSection = document.getElementById('pricing')
    if (pricingSection) {
      observer.observe(pricingSection)
    }

    // 4. Contact/Email Link Clicks
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor || !anchor.href) return

      // Email clicks
      if (anchor.href.includes('mailto:')) {
        trackFbq('track', 'Contact', { content_name: 'Email Click' })
      }

      // Outbound link clicks
      if (anchor.hostname !== window.location.hostname) {
        trackFbq('trackCustom', 'OutboundClick', { url: anchor.href })
      }
    }

    document.addEventListener('click', handleClick)

    // 5. Exit Intent (mouse leaves viewport top)
    let exitTracked = false
    function handleMouseOut(e: MouseEvent) {
      if (e.clientY < 5 && !exitTracked) {
        exitTracked = true
        trackFbq('trackCustom', 'ExitIntent')
      }
    }

    document.addEventListener('mouseout', handleMouseOut)

    // 6. Video Play
    function handleVideoPlay(e: Event) {
      const target = e.target as HTMLElement
      if (target.tagName === 'VIDEO') {
        trackFbq('trackCustom', 'VideoPlay', {
          video_url: (target as HTMLVideoElement).currentSrc || 'unknown',
        })
      }
    }

    document.addEventListener('play', handleVideoPlay, true)

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll)
      timers.forEach(clearTimeout)
      observer.disconnect()
      document.removeEventListener('click', handleClick)
      document.removeEventListener('mouseout', handleMouseOut)
      document.removeEventListener('play', handleVideoPlay, true)
    }
  }, [])

  return null
}
