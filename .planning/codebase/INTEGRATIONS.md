# External Integrations

**Analysis Date:** 2026-01-26

## APIs & External Services

**Not Detected**
- No external API calls found in codebase
- No SDK integrations (Stripe, Supabase, AWS, etc.)
- Application is frontend-only landing page with no backend integrations

## Data Storage

**Databases:**
- None - Application has no persistent data storage
- All content is static/hardcoded in components or translations

**File Storage:**
- Local static assets only (`public/images/`)
- No cloud storage integration (S3, Cloudinary, etc.)

**Caching:**
- Next.js built-in caching via `next/cache`
- No external caching service (Redis, Memcached, etc.)

## Authentication & Identity

**Auth Provider:**
- None - No authentication system implemented
- Application is public landing page with no user accounts
- No login/registration functionality

## Monitoring & Observability

**Error Tracking:**
- None - No error tracking service (Sentry, etc.) configured

**Logs:**
- Console logging only (via Next.js built-in logging)
- No external logging infrastructure

**Analytics:**
- Not detected - No analytics integration (Google Analytics, Mixpanel, etc.)

## CI/CD & Deployment

**Hosting:**
- Not specified in codebase
- Suitable for: Vercel, Netlify, or any Node.js compatible host

**CI Pipeline:**
- Not configured - No CI/CD configuration files found
- Ready for integration with GitHub Actions, GitLab CI, etc.

**Build Process:**
- Next.js standard build via `npm run build`
- Output: optimized `.next/` directory

## Environment Configuration

**Required env vars:**
- None detected - Application requires no environment variables for core functionality
- All configuration is static

**Secrets location:**
- Not applicable - No sensitive data or secrets in configuration

## Webhooks & Callbacks

**Incoming:**
- None - No webhook endpoints

**Outgoing:**
- None - No outbound webhook calls

## Client-Side Libraries (Non-Integrations)

**Icons:**
- lucide-react - Self-contained icon library, no external API calls

**Themes:**
- next-themes - Client-side theme management, no backend integration

**Animations:**
- Framer Motion - Client-side animation library
- No motion backend or animation as a service integration

## Content Management

**Approach:**
- Hardcoded content in React components
- Multilingual content via JSON translation files (`messages/{locale}.json`)
- No CMS integration (Contentful, Strapi, Sanity, etc.)

**Text Management:**
- `messages/en.json` - English content
- `messages/pt-BR.json` - Portuguese-Brazil content
- Content fetched server-side and passed to client components

## Third-Party Services

**Not Integrated:**
- Payment processing (Stripe, PayPal)
- Email service (SendGrid, Mailgun, Nodemailer)
- Form handling (Formspree, Basin, Typeform)
- CDN (Cloudflare, Akamai)
- Analytics (Google Analytics, Mixpanel, Amplitude)
- Monitoring (Sentry, LogRocket, Datadog)
- Social embedding (Instagram, YouTube API)

---

## Architecture Implications

**Stateless Frontend:**
- Application is entirely client-renderable
- No backend API layer exists
- Suitable for static hosting or edge CDN

**Content Management:**
- Content updates require code changes and redeploy
- Consider CMS integration if frequent content updates needed

**Scalability:**
- Static site architecture - infinitely scalable
- No database or API rate limiting concerns
- CDN-friendly with caching strategies

**Future Integration Points:**
- `/api/` routes can be added for backend functionality
- Database can be integrated via Next.js API routes
- Payment provider (Stripe) can be added when pricing becomes active
- Email service can be added for contact forms or newsletter

---

*Integration audit: 2026-01-26*
