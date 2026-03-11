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
  let fbc = getCookie('_fbc')
  const fbclid = params.get('fbclid') || ''
  if (!fbc && fbclid) {
    fbc = 'fb.1.' + Date.now() + '.' + fbclid
  }

  // Meta FBP cookie
  const fbp = getCookie('_fbp')

  // Clarity user ID from _clck cookie
  const clck = getCookie('_clck')
  const clarityUserId = clck ? clck.split('|')[0] : ''

  return {
    ga_client_id: gaClientId,
    ga_session_id: gaSessionId,
    fbc,
    fbp,
    fbclid,
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    utm_term: params.get('utm_term') || '',
    landing_page: window.location.href,
    referrer: document.referrer,
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

// Track WhatsApp click - inserts into Supabase + Clarity + GA4 dataLayer
export function trackWhatsAppClick(pageSection: string) {
  const tracking = getTrackingData()

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
      whatsapp_number: '5511914134580',
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
