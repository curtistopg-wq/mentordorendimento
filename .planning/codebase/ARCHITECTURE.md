# Architecture

**Analysis Date:** 2026-01-26

## Pattern Overview

**Overall:** Component-Driven Layered Architecture with Server-Side Rendering (SSR)

**Key Characteristics:**
- Next.js 14 App Router with dynamic locale routing
- Composition-based page structure (sections assembled into landing page)
- Client-side animations with Framer Motion (all sections marked 'use client')
- International support via next-intl (English, Portuguese-BR)
- Dark/Light theme capability via next-themes

## Layers

**Presentation Layer (Components):**
- Purpose: Render UI sections and interactive components
- Location: `src/components/`
- Contains: Layout components (Header, Footer), section components (Hero, Features, Pricing), UI components (ScrollToTop)
- Depends on: Framer Motion, next-intl, Lucide icons, utility functions
- Used by: Page component

**Layout Layer:**
- Purpose: Provide page structure and meta configuration
- Location: `src/app/[locale]/layout.tsx`
- Contains: HTML structure, theme provider setup, navigation wrapper, internationalization setup
- Depends on: next-intl server utilities, theme provider
- Used by: All locale-specific routes

**Page Layer:**
- Purpose: Orchestrate section composition into landing page
- Location: `src/app/[locale]/page.tsx`
- Contains: Sequence of sections imported and rendered
- Depends on: All section components
- Used by: Next.js routing

**Configuration Layer:**
- Purpose: Centralize internationalization and theme setup
- Location: `src/i18n.ts`, `src/app/globals.css`, `tailwind.config.ts`, `next.config.mjs`
- Contains: Locale definitions, message loading, design tokens, theme colors
- Depends on: Next.js, Tailwind, next-intl
- Used by: Layout layer and all components

**Utility Layer:**
- Purpose: Provide reusable helper functions
- Location: `src/lib/utils.ts`
- Contains: `cn()` function for Tailwind class merging
- Depends on: clsx, tailwind-merge
- Used by: All components requiring dynamic class handling

## Data Flow

**Static Content & Internationalization:**

1. User visits URL with locale (e.g., `/en` or `/pt-BR`)
2. `[locale]/layout.tsx` intercepts request
3. `i18n.ts` loads locale configuration and validates against allowed locales
4. `getMessages()` imported from language JSON file (e.g., `messages/en.json`)
5. Messages passed to NextIntlClientProvider
6. Components use `useTranslations()` hook to access localized strings

**Client-Side Rendering & Animation:**

1. Browser loads HTML skeleton with hydration
2. Components marked 'use client' initialize Framer Motion context
3. Motion variants defined in component files trigger on mount/view
4. ScrollTrigger patterns use `whileInView` to detect viewport visibility
5. Animations execute with staggered children on enter

**Theme Management:**

1. `ThemeProvider` wraps app with next-themes
2. User preference (light/dark) stored in localStorage
3. CSS classes applied to root element (dark mode via Tailwind `dark:` prefix)
4. All color tokens adjust via CSS variables defined in `globals.css`

## Key Abstractions

**Section Pattern:**
- Purpose: Encapsulate page sections as independent, reusable components
- Examples: `src/components/sections/hero.tsx`, `src/components/sections/pricing.tsx`, `src/components/sections/testimonials.tsx`
- Pattern: All sections are React functional components with motion animations, use `whileInView` for lazy animation triggering, managed as discrete content blocks

**Animation Variant Pattern:**
- Purpose: Define reusable motion animations for staggered reveals
- Examples: `container` and `item` variants in features.tsx and testimonials.tsx
- Pattern: Object-based Framer Motion variants with staggerChildren for sequential element reveals

**Localization Hook Pattern:**
- Purpose: Access translated strings within components
- Examples: `const t = useTranslations('hero')` in hero.tsx
- Pattern: namespace-based translation access via hook, typically called at component top level

**Dynamic Class Composition:**
- Purpose: Conditionally apply Tailwind classes based on state/props
- Examples: `cn()` utility used in pricing.tsx for variant-based styling
- Pattern: Central `cn()` function merges clsx output with tailwind-merge to resolve conflicts

## Entry Points

**HTML Entry:**
- Location: `src/app/[locale]/layout.tsx`
- Triggers: Browser navigation to `/{locale}` path
- Responsibilities: Initialize theme provider, load translations, render header/footer wrapper, set metadata

**Page Composition Entry:**
- Location: `src/app/[locale]/page.tsx`
- Triggers: Route render after layout initialization
- Responsibilities: Import and compose all section components in page order

**Client Hydration Entry:**
- Location: Each 'use client' component (all sections, header, footer)
- Triggers: Browser receives HTML, JavaScript bundle loads
- Responsibilities: Initialize React state, attach event listeners, start Framer Motion animations

## Error Handling

**Strategy:** Graceful fallback and notFound() for invalid locales

**Patterns:**
- Invalid locale: `notFound()` called in `i18n.ts` if locale not in allowed list
- Missing translations: next-intl returns key name as fallback
- Missing images: Placeholder SVG or gradient overlay used in sections
- Animation failures: Components degrade to static content if JavaScript disabled (no error thrown)

## Cross-Cutting Concerns

**Logging:** Not implemented - uses console implicitly in development (no explicit logging layer)

**Validation:** Locale validation in `i18n.ts` via allowlist check (`notFound()` on mismatch)

**Authentication:** Not implemented - public landing page with contact/account links placeholder

**Styling:** Tailwind CSS with custom config (`src/app/globals.css`, `tailwind.config.ts`)
- Custom color palette: primary (grays), accent (indigo), metallic (gold, silver, platinum)
- Font families: Inter (body), Poppins (display)
- Responsive breakpoints via Tailwind defaults (sm, md, lg, xl)
- Dark mode via `dark:` class prefix

**Internationalization:** next-intl middleware via plugin in `next.config.mjs`
- Message files in `messages/` directory
- Runtime locale detection from URL segment `[locale]`
- Locale switching via `switchLocale()` in header component

---

*Architecture analysis: 2026-01-26*
