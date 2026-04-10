import { NextResponse } from 'next/server'
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js/min'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ valid: false, error: 'Phone number required' }, { status: 400 })
    }

    const digits = phone.replace(/\D/g, '')
    const withCountry = digits.startsWith('55') ? `+${digits}` : `+55${digits}`

    if (!isValidPhoneNumber(withCountry, 'BR')) {
      return NextResponse.json({ valid: false, error: 'Invalid Brazilian phone number' })
    }

    const parsed = parsePhoneNumber(withCountry, 'BR')
    if (!parsed) {
      return NextResponse.json({ valid: false, error: 'Could not parse phone number' })
    }

    const e164 = parsed.format('E.164')

    const apiKey = process.env.ABSTRACTAPI_PHONE_KEY
    if (apiKey) {
      try {
        const res = await fetch(
          `https://phonevalidation.abstractapi.com/v1/?api_key=${apiKey}&phone=${encodeURIComponent(e164)}`
        )

        if (res.ok) {
          const data = await res.json()

          if (data.valid === false) {
            return NextResponse.json({ valid: false, error: 'Phone number not in service' })
          }

          if (data.type === 'landline') {
            return NextResponse.json({ valid: false, error: 'Please use a mobile number' })
          }

          return NextResponse.json({
            valid: true,
            formatted: e164,
            type: data.type,
            carrier: data.carrier,
          })
        }
      } catch (err) {
        console.error('AbstractAPI error:', err)
      }
    }

    return NextResponse.json({ valid: true, formatted: e164 })
  } catch {
    return NextResponse.json({ valid: false, error: 'Validation failed' }, { status: 500 })
  }
}
