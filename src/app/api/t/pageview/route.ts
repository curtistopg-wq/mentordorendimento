import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ALLOWED_ORIGINS = [
  'https://mentordorendimento.com',
  'https://www.mentordorendimento.com',
  'https://binarypulse.pro',
  'https://www.binarypulse.pro',
]

function getCorsHeaders(origin: string) {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || ''
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(origin) })
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin') || ''
  const CORS_HEADERS = getCorsHeaders(origin)
  try {
    const contentType = request.headers.get('content-type') || ''
    let body: Record<string, unknown>

    if (contentType.includes('application/json')) {
      body = await request.json()
    } else {
      const text = await request.text()
      body = JSON.parse(text)
    }

    const {
      session_id, site, page_url, referrer, user_agent,
      landing_page, utm_source, utm_medium, utm_campaign,
      utm_content, utm_term, fbclid, gclid,
    } = body as Record<string, string | null>

    if (!session_id || !site || !page_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const { error } = await supabase.rpc('pd_track_pageview', {
      p_session_id: session_id,
      p_site: site,
      p_page_url: page_url,
      p_referrer: referrer || null,
      p_user_agent: user_agent || null,
      p_utm_source: utm_source || null,
      p_utm_medium: utm_medium || null,
      p_utm_campaign: utm_campaign || null,
      p_utm_content: utm_content || null,
      p_utm_term: utm_term || null,
      p_fbclid: fbclid || null,
      p_gclid: gclid || null,
      p_landing_page: landing_page || null,
    })

    if (error) {
      console.error('pd_track_pageview error:', error.message)
      return NextResponse.json(
        { error: 'Tracking failed' },
        { status: 500, headers: CORS_HEADERS }
      )
    }

    return NextResponse.json({ status: 'ok' }, { headers: CORS_HEADERS })
  } catch (err) {
    console.error('Pageview tracking error:', err)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400, headers: CORS_HEADERS }
    )
  }
}
