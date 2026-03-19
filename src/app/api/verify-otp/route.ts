import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const OTP_TTL_SECONDS = 10 * 60; // 10 minutes

function createHmac(code: string, email: string, timestamp: number): string {
  const secret = process.env.RESEND_API_KEY;
  if (!secret) throw new Error("RESEND_API_KEY not configured");

  const payload = `${code}|${email.toLowerCase()}|${timestamp}`;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

const ALLOWED_ORIGINS = [
  'https://mentordorendimento.com',
  'https://www.mentordorendimento.com',
  'https://binarypulse.pro',
  'https://www.binarypulse.pro',
]

function getCorsHeaders(origin: string) {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || ''
  return NextResponse.json(null, { status: 204, headers: getCorsHeaders(origin) });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin') || ''
  const corsHeaders = getCorsHeaders(origin)
  try {
    const body = await request.json();
    const { email, code, token, timestamp } = body as {
      email?: string;
      code?: string;
      token?: string;
      timestamp?: number;
    };

    if (
      !email ||
      !code ||
      !token ||
      timestamp === undefined ||
      timestamp === null
    ) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Todos os campos são obrigatórios.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    if (typeof email !== "string" || typeof code !== "string" || typeof token !== "string" || typeof timestamp !== "number") {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Dados inválidos.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check expiration
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (nowSeconds - timestamp > OTP_TTL_SECONDS) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Código expirado. Solicite um novo código.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify HMAC
    const expectedToken = createHmac(code, email, timestamp);
    const expectedBuf = Buffer.from(expectedToken, "hex");
    const tokenBuf = Buffer.from(token, "hex");

    // Guard against different buffer lengths (malformed token)
    if (expectedBuf.length !== tokenBuf.length) {
      return NextResponse.json(
        { success: false, verified: false, error: "Código incorreto. Verifique e tente novamente." },
        { status: 400, headers: corsHeaders }
      );
    }

    const isValid = crypto.timingSafeEqual(expectedBuf, tokenBuf);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Código incorreto.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, verified: true },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("verify-otp error:", error);
    return NextResponse.json(
      {
        success: false,
        verified: false,
        error: "Erro interno do servidor.",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
