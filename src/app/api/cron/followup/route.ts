import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)

export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get leads needing follow-up via RPC (SECURITY DEFINER function)
  const { data: leads, error } = await supabase.rpc('get_followup_leads')

  if (error) {
    console.error('Failed to fetch followup leads:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!leads || leads.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No leads need follow-up' })
  }

  let sent = 0
  let failed = 0

  for (const lead of leads) {
    const nextStage = lead.followup_stage + 1
    const template = getEmailTemplate(nextStage, lead.name)

    try {
      const { error: sendError } = await resend.emails.send({
        from: 'Mentor do Rendimento <noreply@mentordorendimento.com>',
        to: lead.email,
        subject: template.subject,
        html: template.html,
      })

      if (sendError) {
        console.error(`Follow-up ${nextStage} failed for ${lead.email}:`, sendError)
        failed++
        continue
      }

      // Mark as sent
      await supabase.rpc('mark_followup_sent', {
        lead_id: lead.id,
        new_stage: nextStage,
      })

      sent++
    } catch (err) {
      console.error(`Follow-up error for ${lead.email}:`, err)
      failed++
    }
  }

  return NextResponse.json({ sent, failed, total: leads.length })
}

function getEmailTemplate(stage: number, name?: string) {
  const greeting = name ? name.split(' ')[0] : 'Futuro trader'

  switch (stage) {
    case 1:
      return {
        subject: 'Sua vaga ainda está reservada — complete seu cadastro!',
        html: buildEmail({
          greeting,
          headline: 'Sua vaga está reservada! 🎯',
          body: `
            <p style="color:#4a5568;font-size:16px;line-height:1.6;margin:0 0 20px;">
              Você se cadastrou para a <strong>aula gratuita</strong> do Mentor do Rendimento, mas ainda não completou sua inscrição.
            </p>
            <p style="color:#4a5568;font-size:16px;line-height:1.6;margin:0 0 30px;">
              Complete agora para garantir acesso ao conteúdo exclusivo que vai transformar sua forma de operar no mercado.
            </p>
          `,
          ctaText: 'COMPLETAR MINHA INSCRIÇÃO',
          ctaUrl: 'https://mentordorendimento.com/pt-BR#hero',
        }),
      }

    case 2:
      return {
        subject: `${greeting}, +3.000 alunos já estão lucrando — e você?`,
        html: buildEmail({
          greeting,
          headline: 'Milhares já estão transformando suas carreiras',
          body: `
            <p style="color:#4a5568;font-size:16px;line-height:1.6;margin:0 0 20px;">
              Enquanto você lê este e-mail, mais de <strong>3.000 alunos</strong> estão aplicando nossas estratégias testadas no mercado real.
            </p>
            <div style="background:#f7fafc;border-left:4px solid #48bb78;padding:16px 20px;margin:0 0 20px;">
              <p style="color:#2d3748;font-size:15px;line-height:1.6;margin:0;font-style:italic;">
                "Esse curso mudou completamente minha forma de ver o trading. Saí do prejuízo pra lucro consistente em 3 meses."
              </p>
              <p style="color:#718096;font-size:13px;margin:8px 0 0;"><strong>— Lucas Fernandes</strong>, São Paulo</p>
            </div>
            <p style="color:#4a5568;font-size:16px;line-height:1.6;margin:0 0 30px;">
              Sua aula gratuita ainda está disponível. Acesse agora e veja por que nossos alunos recomendam com nota <strong>4.9/5</strong>.
            </p>
          `,
          ctaText: 'ACESSAR MINHA AULA GRÁTIS',
          ctaUrl: 'https://mentordorendimento.com/pt-BR#hero',
        }),
      }

    case 3:
      return {
        subject: `Última chance, ${greeting} — sua vaga expira em breve`,
        html: buildEmail({
          greeting,
          headline: 'Última oportunidade ⏰',
          body: `
            <p style="color:#4a5568;font-size:16px;line-height:1.6;margin:0 0 20px;">
              Essa é nossa última mensagem sobre sua vaga na <strong>aula gratuita</strong>.
            </p>
            <p style="color:#4a5568;font-size:16px;line-height:1.6;margin:0 0 20px;">
              Nossas turmas são limitadas e novas vagas estão sendo preenchidas todos os dias. Não queremos que você perca essa oportunidade.
            </p>
            <div style="background:#fff5f5;border-left:4px solid #e53e3e;padding:16px 20px;margin:0 0 20px;">
              <p style="color:#2d3748;font-size:15px;line-height:1.6;margin:0;">
                <strong>O que você recebe gratuitamente:</strong>
              </p>
              <ul style="color:#4a5568;font-size:14px;line-height:1.8;margin:8px 0 0;padding-left:20px;">
                <li>Aula completa com estratégias reais</li>
                <li>Acesso à comunidade de traders</li>
                <li>Material de estudo exclusivo</li>
              </ul>
            </div>
            <p style="color:#4a5568;font-size:16px;line-height:1.6;margin:0 0 30px;">
              Clique abaixo para garantir sua vaga antes que ela expire.
            </p>
          `,
          ctaText: 'GARANTIR MINHA VAGA AGORA',
          ctaUrl: 'https://mentordorendimento.com/pt-BR#hero',
        }),
      }

    default:
      return { subject: '', html: '' }
  }
}

function buildEmail(params: {
  greeting: string
  headline: string
  body: string
  ctaText: string
  ctaUrl: string
}): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f7fafc;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:100%;">
          <tr>
            <td style="background-color:#1a202c;padding:30px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">Mentor do Rendimento</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;">
              <h2 style="color:#1a202c;margin:0 0 20px;font-size:22px;">${params.headline}</h2>
              <p style="color:#4a5568;font-size:16px;line-height:1.6;margin:0 0 20px;">
                Olá, <strong>${params.greeting}</strong>!
              </p>
              ${params.body}
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${params.ctaUrl}"
                       style="display:inline-block;background-color:#48bb78;color:#ffffff;font-size:16px;font-weight:bold;padding:14px 40px;text-decoration:none;border-radius:4px;">
                      ${params.ctaText}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#718096;font-size:14px;line-height:1.6;margin:30px 0 0;">
                Dúvidas? Fale conosco pelo WhatsApp: <a href="https://wa.me/5511914134580" style="color:#25D366;">+55 11 91413-4580</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f7fafc;padding:20px 30px;text-align:center;">
              <p style="color:#a0aec0;font-size:12px;margin:0;">
                &copy; 2026 Mentor do Rendimento. Todos os direitos reservados.
              </p>
              <p style="color:#cbd5e0;font-size:11px;margin:8px 0 0;">
                <a href="https://mentordorendimento.com/pt-BR" style="color:#cbd5e0;">Cancelar inscrição</a>
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
