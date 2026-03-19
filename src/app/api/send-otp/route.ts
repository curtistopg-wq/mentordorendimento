import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// In-memory rate limit store: email -> { count, firstRequestTime }
const rateLimitMap = new Map<
  string,
  { count: number; firstRequestTime: number }
>();

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 3;
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function generateOtp(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1000000).padStart(6, "0");
}

function createHmac(code: string, email: string, timestamp: number): string {
  const secret = process.env.RESEND_API_KEY;
  if (!secret) throw new Error("RESEND_API_KEY not configured");

  const payload = `${code}|${email.toLowerCase()}|${timestamp}`;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function isRateLimited(email: string): boolean {
  const key = email.toLowerCase();
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now - entry.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, firstRequestTime: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  return false;
}

function buildEmailHtml(code: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Código de Verificação</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color:#5c6bc0;padding:28px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;letter-spacing:-0.01em;">
                Mentor do Rendimento
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;font-weight:500;">
                Seu código de verificação
              </p>
              <div style="margin:20px 0 28px;padding:20px;background-color:#f8f9fc;border-radius:8px;text-align:center;border:1px solid #e8eaf0;">
                <span style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:700;letter-spacing:8px;color:#1f2937;">
                  ${code}
                </span>
              </div>
              <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
                Este código expira em <strong>10 minutos</strong>.
              </p>
              <p style="margin:16px 0 0;color:#6b7280;font-size:14px;line-height:1.6;">
                Se você não solicitou este código, ignore este email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background-color:#f9fafb;border-top:1px solid #f0f0f5;">
              <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                Mentor do Rendimento &mdash; mentordorendimento.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body as { email?: string };

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Email é obrigatório." },
        { status: 400, headers: corsHeaders }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Email inválido." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (isRateLimited(email)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Muitas tentativas. Aguarde 10 minutos antes de solicitar um novo código.",
        },
        { status: 429, headers: corsHeaders }
      );
    }

    const code = generateOtp();
    const timestamp = Math.floor(Date.now() / 1000);
    const token = createHmac(code, email, timestamp);

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { success: false, error: "Serviço de email não configurado." },
        { status: 500, headers: corsHeaders }
      );
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Mentor do Rendimento <noreply@mentordorendimento.com>",
        to: [email],
        subject: `Seu código de verificação: ${code}`,
        html: buildEmailHtml(code),
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json().catch(() => null);
      console.error("Resend API error:", resendResponse.status, errorData);
      return NextResponse.json(
        {
          success: false,
          error: "Falha ao enviar o email. Tente novamente.",
        },
        { status: 502, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, token, timestamp },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("send-otp error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor." },
      { status: 500, headers: corsHeaders }
    );
  }
}
