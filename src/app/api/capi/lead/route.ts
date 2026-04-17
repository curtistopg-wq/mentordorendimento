import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

const PRIMARY_PIXEL_ID = '1942865179739073'
const BACKUP_PIXEL_ID = '1548652783347184'
const API_VERSION = 'v21.0'
const ALLOWED_EVENTS = ['Lead', 'CompleteRegistration', 'InitiateCheckout', 'PageView', 'Contact']

// Rate limit: 30 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; firstRequestTime: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX = 30

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now - entry.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, firstRequestTime: now })
    return false
  }
  if (entry.count >= RATE_LIMIT_MAX) return true
  entry.count += 1
  return false
}

function getAccessToken() {
  return process.env.META_CAPI_ACCESS_TOKEN || ''
}

function sha256(value: string): string {
  if (!value) return ''
  return createHash('sha256').update(value.toLowerCase().trim()).digest('hex')
}

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || ''
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)

    if (isRateLimited(clientIp || 'unknown')) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const {
      event_name,
      event_id,
      email,
      phone,
      first_name,
      fbc,
      fbp,
      source_url,
      user_agent,
    } = await request.json()

    if (!event_name || !event_id) {
      return NextResponse.json({ error: 'Missing event_name or event_id' }, { status: 400 })
    }

    if (!ALLOWED_EVENTS.includes(event_name)) {
      return NextResponse.json({ error: 'Invalid event_name' }, { status: 400 })
    }

    const token = getAccessToken()
    if (!token) {
      console.error('CAPI: META_CAPI_ACCESS_TOKEN not set')
      return NextResponse.json({ error: 'CAPI not configured' }, { status: 500 })
    }

    // Build user_data with hashed PII (Meta requires SHA-256)
    const user_data: Record<string, string | string[]> = {}
    if (email) user_data.em = [sha256(email)]
    if (phone) user_data.ph = [sha256(phone)]
    if (first_name) user_data.fn = [sha256(first_name)]
    if (fbc) user_data.fbc = fbc
    if (fbp) user_data.fbp = fbp
    if (clientIp) user_data.client_ip_address = clientIp
    if (user_agent) user_data.client_user_agent = user_agent

    const payload = {
      data: [
        {
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id, // Same ID as browser Pixel for dedup
          action_source: 'website',
          event_source_url: source_url || 'https://www.mentordorendimento.com/pt-BR',
          user_data,
        },
      ],
    }

    const backupToken = process.env.META_CAPI_BACKUP_TOKEN || ''

    // Send to both pixels in parallel
    const [primaryResult, backupResult] = await Promise.allSettled([
      fetch(`https://graph.facebook.com/${API_VERSION}/${PRIMARY_PIXEL_ID}/events?access_token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(r => r.json()),
      backupToken
        ? fetch(`https://graph.facebook.com/${API_VERSION}/${BACKUP_PIXEL_ID}/events?access_token=${backupToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }).then(r => r.json())
        : Promise.resolve({ skipped: true }),
    ])

    const primaryOk = primaryResult.status === 'fulfilled'
    const backupOk = backupResult.status === 'fulfilled'

    if (!primaryOk) console.error('CAPI primary error:', primaryResult)
    if (!backupOk) console.error('CAPI backup error:', backupResult)

    return NextResponse.json({
      success: primaryOk || backupOk,
      primary: primaryOk ? primaryResult.value : 'failed',
      backup: backupOk ? backupResult.value : 'failed',
    })
  } catch (err) {
    console.error('CAPI exception:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
