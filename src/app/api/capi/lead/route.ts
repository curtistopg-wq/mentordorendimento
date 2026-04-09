import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

const PIXEL_ID = '1856669588586928'
const API_VERSION = 'v21.0'

function getAccessToken() {
  return process.env.META_CAPI_ACCESS_TOKEN || ''
}

function sha256(value: string): string {
  if (!value) return ''
  return createHash('sha256').update(value.toLowerCase().trim()).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
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
      ip_address,
    } = await request.json()

    if (!event_name || !event_id) {
      return NextResponse.json({ error: 'Missing event_name or event_id' }, { status: 400 })
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
    if (ip_address) user_data.client_ip_address = ip_address
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

    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${token}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('CAPI error:', JSON.stringify(result))
      return NextResponse.json({ error: 'CAPI request failed', details: result }, { status: 500 })
    }

    return NextResponse.json({ success: true, events_received: result.events_received })
  } catch (err) {
    console.error('CAPI exception:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
