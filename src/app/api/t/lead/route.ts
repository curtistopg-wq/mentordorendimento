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
    const { session_id, site, name, email, phone } = await request.json()

    if (!site || !email) {
      return NextResponse.json(
        { error: 'Missing required fields (site, email)' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const { data, error } = await supabase.rpc('pd_track_lead', {
      p_session_id: session_id || null,
      p_site: site,
      p_name: name || null,
      p_email: email.toLowerCase().trim(),
      p_phone: phone || null,
    })

    if (error) {
      console.error('pd_track_lead error:', error.message)
      return NextResponse.json(
        { error: 'Tracking failed' },
        { status: 500, headers: CORS_HEADERS }
      )
    }

    return NextResponse.json(data || { status: 'ok' }, { headers: CORS_HEADERS })
  } catch (err) {
    console.error('Lead tracking error:', err)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400, headers: CORS_HEADERS }
    )
  }
}
