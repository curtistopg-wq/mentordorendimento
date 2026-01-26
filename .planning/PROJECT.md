# Mestres - Online Course Platform

## What This Is

A full-featured online course platform where users can browse, purchase, and consume video-based educational content. Built as a modern Next.js application with Supabase backend, targeting deployment on Vercel. Currently a marketing landing page being evolved into a complete learning management system.

## Core Value

**Users can access and watch premium course content seamlessly after authenticating.**

If everything else fails, video playback and course access must work. This is the core promise to paying customers.

## Requirements

### Validated

- ✓ Marketing landing page structure — existing
- ✓ Hero, features, pricing, testimonials, FAQ sections — existing
- ✓ Internationalization (EN/PT-BR) — existing
- ✓ Dark/Light theme support (infrastructure) — existing
- ✓ Responsive design — existing
- ✓ Framer Motion animations — existing

### Active

**Landing Page Polish:**
- [ ] Theme toggle functional (dark/light switching)
- [ ] Contact form with email delivery
- [ ] Performance optimization (Core Web Vitals)
- [ ] SEO (meta tags, sitemap, robots.txt, structured data)

**Authentication:**
- [ ] OAuth login (Google) via Supabase
- [ ] OAuth login (GitHub) via Supabase
- [ ] User session persistence
- [ ] Protected route middleware
- [ ] Logout functionality

**User Dashboard:**
- [ ] Dashboard layout and navigation
- [ ] View enrolled courses
- [ ] Course progress tracking (lessons completed)
- [ ] Profile editing (name, avatar, email)
- [ ] Download course materials

**Course System:**
- [ ] Course listing page
- [ ] Course detail page
- [ ] Lesson video player (self-hosted)
- [ ] Lesson progress marking
- [ ] Resource/material downloads per lesson

**Admin CMS:**
- [ ] Admin authentication/authorization
- [ ] Course CRUD (create, read, update, delete)
- [ ] Lesson management with video upload
- [ ] Resource/material upload
- [ ] User management (view, basic actions)
- [ ] Rich text editor for descriptions
- [ ] Basic analytics dashboard

### Out of Scope

- Payment integration (Stripe/LemonSqueezy) — deferred to v2, need to validate user interest first
- Comments/discussion forums — adds moderation complexity
- Live sessions/webinars — different infrastructure requirements
- Certificates/badges — nice-to-have after core is solid
- Mobile native app — web-first, PWA possible later
- Multi-instructor support — single admin for v1
- Subscription model — one-time access for v1

## Context

**Origin:** Clone/replica of "Mestres" course platform
**Current state:** Marketing landing page with section components, no backend
**Target market:** Portuguese/Brazilian audience (PT-BR primary locale)
**Existing patterns:** Component-driven architecture, Tailwind + Framer Motion

**Technical environment:**
- Next.js 14.2 with App Router
- TypeScript strict mode
- Tailwind CSS 3.4 with custom design tokens
- Framer Motion for animations
- next-intl for i18n
- next-themes for theming (needs fixing)

**Known issues from codebase analysis:**
- Theme toggle button non-functional
- User account button is placeholder
- No error boundaries
- No testing infrastructure
- Hardcoded content in some components

## Constraints

- **Backend**: Supabase only — unified auth, database, and storage
- **Deployment**: Vercel — optimized for Next.js, free tier available
- **Video hosting**: Self-hosted via Supabase Storage — no YouTube/Vimeo embeds
- **Auth methods**: OAuth only (Google, GitHub) — no email/password for v1
- **Payment**: None for v1 — manual enrollment or free access initially
- **Language**: Maintain existing i18n structure (EN/PT-BR)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase for backend | All-in-one (auth + db + storage), great DX, generous free tier | — Pending |
| OAuth-only auth | Faster to implement, better UX, no password management | — Pending |
| Self-hosted video | Full control, no third-party branding, works with Supabase Storage | — Pending |
| Defer payments | Validate platform first, add monetization after user traction | — Pending |
| Full CMS vs Supabase dashboard | Better admin UX, scalable for future instructors | — Pending |
| Vercel deployment | Native Next.js support, easy CI/CD, preview deployments | — Pending |

---
*Last updated: 2025-01-26 after initialization*
