import { type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { updateSession } from '@/lib/supabase/middleware'
import { locales, defaultLocale } from './src/i18n'

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
})

export async function middleware(request: NextRequest) {
  // First, refresh Supabase session (sets cookies on response)
  const supabaseResponse = await updateSession(request)

  // Then run i18n middleware
  const intlResponse = intlMiddleware(request)

  // Merge cookies from Supabase response into i18n response
  supabaseResponse.cookies.getAll().forEach(cookie => {
    intlResponse.cookies.set(cookie.name, cookie.value)
  })

  return intlResponse
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes that don't need i18n/auth
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
