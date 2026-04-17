import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

// Rate limit: 3 emails per email address per 10 minutes
const rateLimitMap = new Map<string, { count: number; firstRequestTime: number }>()
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 3

function isRateLimited(email: string): boolean {
  const key = email.toLowerCase()
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (!entry || now - entry.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, firstRequestTime: now })
    return false
  }
  if (entry.count >= RATE_LIMIT_MAX) return true
  entry.count += 1
  return false
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    if (isRateLimited(email)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { data, error } = await getResend().emails.send({
      from: 'Mentor do Rendimento <noreply@mentordorendimento.com>',
      to: email,
      subject: 'Bem-vindo ao Mentor do Rendimento!',
      html: getWelcomeEmailHtml(),
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    console.error('Send email error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getWelcomeEmailHtml(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f7fafc;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:100%;">
          <tr>
            <td style="background-color:#0D1B2A;padding:30px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">Mentor do Rendimento</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;">
              <h2 style="color:#0D1B2A;margin:0 0 20px;font-size:22px;">Bem-vindo! 🎉</h2>
              <p style="color:#486581;font-size:16px;line-height:1.6;margin:0 0 20px;">
                Obrigado por se cadastrar! Você deu o primeiro passo rumo a uma jornada de excelência no mercado financeiro.
              </p>
              <p style="color:#486581;font-size:16px;line-height:1.6;margin:0 0 30px;">
                Para garantir acesso completo à sua <strong>aula gratuita</strong>, complete seu cadastro clicando no botão abaixo:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://mentordorendimento.com/pt-BR#hero"
                       style="display:inline-block;background-color:#F97316;color:#ffffff;font-size:16px;font-weight:bold;padding:14px 40px;text-decoration:none;border-radius:4px;">
                      COMPLETAR CADASTRO
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#718096;font-size:14px;line-height:1.6;margin:30px 0 0;">
                Dúvidas? Fale conosco pelo WhatsApp: <a href="https://wa.me/5511926928065" style="color:#25D366;">+55 11 92692-8065</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f7fafc;padding:20px 30px;text-align:center;">
              <p style="color:#a0aec0;font-size:12px;margin:0;">
                &copy; 2026 Mentor do Rendimento. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
