// Shared tracking utility - reads cookies, URL params, generates event IDs
// Used by all forms to capture attribution data alongside lead submissions

// Window types are declared in src/types/global.d.ts

export interface TrackingData {
  ga_client_id: string
  ga_session_id: string
  fbc: string
  fbp: string
  fbclid: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  utm_term: string
  landing_page: string
  referrer: string
  clarity_user_id: string
}

function getCookie(name: string): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : ''
}

export function getTrackingData(): TrackingData {
  if (typeof window === 'undefined') {
    return {
      ga_client_id: '', ga_session_id: '', fbc: '', fbp: '', fbclid: '',
      utm_source: '', utm_medium: '', utm_campaign: '', utm_content: '', utm_term: '',
      landing_page: '', referrer: '', clarity_user_id: '',
    }
  }

  const params = new URLSearchParams(window.location.search)

  // Persist UTM params in localStorage on first ad click (survives sessions)
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'] as const
  const hasUtm = utmKeys.some(k => params.has(k))
  if (hasUtm) {
    try {
      for (const k of utmKeys) {
        const v = params.get(k)
        if (v) localStorage.setItem(`mdr_first_${k}`, v)
      }
      localStorage.setItem('mdr_first_landing', window.location.href)
      localStorage.setItem('mdr_first_referrer', document.referrer)
    } catch { /* localStorage unavailable */ }
  }

  // GA4 Client ID from _ga cookie (strip GA1.1. prefix)
  const gaRaw = getCookie('_ga')
  const gaClientId = gaRaw ? gaRaw.substring(6) : ''

  // GA4 Session ID from _ga_XXXXXXX cookie
  let gaSessionId = ''
  const allCookies = document.cookie
  const sessionMatch = allCookies.match(/(^| )_ga_[A-Z0-9]+=([^;]+)/)
  if (sessionMatch) {
    const parts = sessionMatch[2].split('.')
    gaSessionId = parts.length >= 3 ? parts[2] : ''
  }

  // Meta FBC cookie (or construct from fbclid)
  // Fallback chain: _fbc cookie → mdr_fbclid cookie → URL param
  let fbc = getCookie('_fbc')
  const fbclid = params.get('fbclid') || getCookie('mdr_fbclid') || ''
  if (!fbc && fbclid) {
    fbc = 'fb.1.' + Date.now() + '.' + fbclid
  }

  // Meta FBP cookie - try primary then backup
  const fbp = getCookie('_fbp') || getCookie('mdr_fbp')

  // Clarity user ID from _clck cookie
  const clck = getCookie('_clck')
  const clarityUserId = clck ? clck.split('|')[0] : ''

  // SSR-safe fallback chain: URL params → cookie (30d) → sessionStorage → localStorage (first touch)
  const ss = (key: string): string => {
    try {
      // Try cookie first (survives tab close)
      const cookieVal = getCookie(key)
      if (cookieVal) return decodeURIComponent(cookieVal)
      // Fall back to sessionStorage
      return sessionStorage?.getItem(key) || ''
    } catch { return '' }
  }

  // First-touch localStorage fallback (persists across sessions)
  const ft = (key: string): string => {
    try { return localStorage?.getItem(`mdr_first_${key}`) || '' } catch { return '' }
  }

  return {
    ga_client_id: gaClientId,
    ga_session_id: gaSessionId,
    fbc,
    fbp,
    fbclid: fbclid || ss('mdr_fbclid') || ft('fbclid'),
    utm_source: params.get('utm_source') || ss('mdr_utm_source') || ft('utm_source'),
    utm_medium: params.get('utm_medium') || ss('mdr_utm_medium') || ft('utm_medium'),
    utm_campaign: params.get('utm_campaign') || ss('mdr_utm_campaign') || ft('utm_campaign'),
    utm_content: params.get('utm_content') || ss('mdr_utm_content') || ft('utm_content'),
    utm_term: params.get('utm_term') || ss('mdr_utm_term') || ft('utm_term'),
    landing_page: window.location.href || ss('mdr_landing'),
    referrer: document.referrer || ss('mdr_referrer') || ft('referrer'),
    clarity_user_id: clarityUserId,
  }
}

// Generate UUID v4 for event deduplication (same ID to Pixel + CAPI via sGTM)
export function generateEventId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

// SHA-256 hash for PII sent to Clarity/GA4 (not raw email/phone)
export async function hashPII(value: string): Promise<string> {
  if (!value) return ''
  const normalized = value.toLowerCase().trim()
  const encoder = new TextEncoder()
  const data = encoder.encode(normalized)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Re-init Meta Pixels with user data for Advanced Matching
// Call BEFORE firing Lead/Contact events so Meta can match the visitor to a FB account
const PRIMARY_PIXEL_ID = '1450798786797629'
const BACKUP_PIXEL_ID = '1548652783347184'

export function setAdvancedMatching(params: {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
}) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return

  const userData: Record<string, string> = {}
  if (params.email) userData.em = params.email.toLowerCase().trim()
  if (params.phone) userData.ph = params.phone.replace(/\D/g, '')
  if (params.firstName) userData.fn = params.firstName.toLowerCase().trim()
  if (params.lastName) userData.ln = params.lastName.toLowerCase().trim()

  if (Object.keys(userData).length === 0) return

  window.fbq('init', PRIMARY_PIXEL_ID, userData)
  window.fbq('init', BACKUP_PIXEL_ID, userData)
}

// Push lead event to dataLayer with tracking + dedup event_id
export function pushLeadEvent(params: {
  formType: string
  leadSource: string
  email: string
  phone?: string
  firstName?: string
  eventId: string
  trackingData: TrackingData
}) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: 'generate_lead',
    event_id: params.eventId,
    form_type: params.formType,
    lead_source: params.leadSource,
    page_location: window.location.href,
    user_email: params.email,
    user_phone: params.phone || '',
    user_first_name: params.firstName || '',
    ga_client_id: params.trackingData.ga_client_id,
    fbc: params.trackingData.fbc,
    fbp: params.trackingData.fbp,
  })
}

// Track WhatsApp click - inserts into Supabase + Clarity + GA4 dataLayer + Meta Pixel + CAPI
export function trackWhatsAppClick(pageSection: string) {
  const tracking = getTrackingData()
  const eventId = generateEventId()

  // Meta Pixel — Contact event for WhatsApp clicks (with eventID for CAPI dedup)
  window.fbq?.('track', 'Contact', {
    content_name: 'WhatsApp Click',
    content_category: pageSection,
  }, {
    eventID: eventId,
  })

  // Server-side CAPI for Contact event (matches pixel eventID for dedup)
  fetch('/api/capi/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_name: 'Contact',
      event_id: eventId,
      fbc: tracking.fbc,
      fbp: tracking.fbp,
      source_url: window.location.href,
      user_agent: navigator.userAgent,
    }),
    keepalive: true,
  }).catch(() => {})

  // Lazy import to avoid circular deps
  import('@/lib/supabase/client').then(({ createClient }) => {
    const supabase = createClient()
    supabase.from('whatsapp_clicks').insert({
      ga_client_id: tracking.ga_client_id,
      ga_session_id: tracking.ga_session_id,
      fbc: tracking.fbc,
      fbp: tracking.fbp,
      fbclid: tracking.fbclid,
      utm_source: tracking.utm_source,
      utm_medium: tracking.utm_medium,
      utm_campaign: tracking.utm_campaign,
      landing_page: tracking.landing_page,
      referrer: tracking.referrer,
      whatsapp_number: '5511996181548',
      page_section: pageSection,
    }).then(({ error }) => {
      if (error) console.error('WhatsApp click tracking failed:', error.message)
    })
  })

  window.clarity?.('event', 'whatsapp_click')
  window.clarity?.('set', 'whatsapp_clicked', 'true')
  window.clarity?.('set', 'whatsapp_section', pageSection)

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: 'whatsapp_click',
    page_section: pageSection,
    utm_source: tracking.utm_source,
    utm_medium: tracking.utm_medium,
  })
}

// Track bank details dropdown open - Clarity + GA4 dataLayer + Meta Pixel
export function trackBankDetailsOpen(planKey: string) {
  window.fbq?.('trackCustom', 'BankDetailsOpen', {
    plan: planKey,
    content_category: 'Trading Course',
  })

  window.clarity?.('event', 'bank_details_open')
  window.clarity?.('set', 'bank_details_plan', planKey)

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: 'bank_details_open',
    plan: planKey,
    page_section: `pricing-${planKey}`,
  })
}

// Track bank detail field copy - Clarity + GA4 dataLayer + Meta Pixel
export function trackBankDetailsCopy(planKey: string, field: string) {
  window.fbq?.('trackCustom', 'BankDetailCopy', {
    plan: planKey,
    field,
    content_category: 'Trading Course',
  })

  window.clarity?.('event', 'bank_detail_copy')
  window.clarity?.('set', 'bank_copy_field', field)

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: 'bank_detail_copy',
    plan: planKey,
    field,
    page_section: `pricing-${planKey}`,
  })
}

// Tag Clarity session with lead info
export async function tagClarityLead(params: {
  email: string
  formType: string
  leadSource: string
}) {
  const hashedEmail = await hashPII(params.email)
  window.clarity?.('set', 'lead_email', hashedEmail)
  window.clarity?.('set', 'form_type', params.formType)
  window.clarity?.('set', 'lead_source', params.leadSource)
  window.clarity?.('set', 'lead_submitted', 'true')
}
