# Codebase Structure

**Analysis Date:** 2026-01-26

## Directory Layout

```
mestres-clone/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx          # Root layout with theme & i18n setup
│   │   │   └── page.tsx            # Landing page section composition
│   │   └── globals.css             # Global styles, Tailwind layers
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header.tsx          # Top navigation with language switcher
│   │   │   └── footer.tsx          # Footer with links
│   │   ├── sections/
│   │   │   ├── hero.tsx            # Hero section
│   │   │   ├── features.tsx        # Feature cards with icons
│   │   │   ├── platform.tsx        # Platform mockup section
│   │   │   ├── pricing.tsx         # Pricing cards (Silver/Gold/Platinum)
│   │   │   ├── guarantee.tsx       # Guarantee/warranty section
│   │   │   ├── stats.tsx           # Statistics display
│   │   │   ├── courses-accordion.tsx # Accordion with courses info
│   │   │   ├── testimonials.tsx    # User testimonials grid
│   │   │   ├── cta.tsx             # Call-to-action section
│   │   │   └── faq.tsx             # FAQ section
│   │   ├── ui/
│   │   │   └── scroll-to-top.tsx   # Floating scroll to top button
│   │   └── theme-provider.tsx      # Theme provider wrapper
│   ├── lib/
│   │   └── utils.ts                # Utility functions (cn())
│   ├── i18n.ts                     # Internationalization config
│   └── messages/
│       ├── en.json                 # English translations
│       └── pt-BR.json              # Portuguese-BR translations
├── public/
│   └── images/                     # Image assets
├── .next/                          # Next.js build output
├── node_modules/                   # Dependencies
├── .planning/
│   └── codebase/                   # Documentation (this folder)
├── tailwind.config.ts              # Tailwind CSS config
├── tsconfig.json                   # TypeScript config
├── next.config.mjs                 # Next.js config with i18n plugin
└── package.json                    # Dependencies & scripts
```

## Directory Purposes

**src/app/:**
- Purpose: Next.js App Router pages and layouts
- Contains: Locale-based routing, page composition, global styles
- Key files: `[locale]/layout.tsx` (root wrapper), `[locale]/page.tsx` (landing page), `globals.css` (design system)

**src/components/layout/:**
- Purpose: Global page chrome (header, footer)
- Contains: Navigation, branding, persistent UI
- Key files: `header.tsx` (logo, nav links, language/theme toggles), `footer.tsx` (links, copyright)

**src/components/sections/:**
- Purpose: Page section blocks, each self-contained with animations
- Contains: Hero, features, pricing, testimonials, CTAs, FAQ, platform showcase
- Key files: All section components imported and composed in `page.tsx`

**src/components/ui/:**
- Purpose: Reusable UI utilities and microcomponents
- Contains: ScrollToTop button with viewport detection
- Key files: `scroll-to-top.tsx`

**src/lib/:**
- Purpose: Shared utility functions and helpers
- Contains: Class merging, formatting, constants
- Key files: `utils.ts` (cn function for Tailwind merging)

**src/i18n.ts:**
- Purpose: Internationalization configuration
- Contains: Locale allowlist, message loading logic
- Key files: Imports from `messages/en.json` and `messages/pt-BR.json`

**public/images/:**
- Purpose: Static image assets
- Contains: Hero background, section images, testimonial avatars, platform screenshots
- Key files: `hero-bg.jpg`, `courses-image.jpg`, `platform-screenshot.png`, `testimonial-*.jpg`

## Key File Locations

**Entry Points:**
- `src/app/[locale]/layout.tsx`: HTML root, theme/i18n initialization
- `src/app/[locale]/page.tsx`: Landing page composition (all sections)
- `next.config.mjs`: Next.js + i18n plugin setup

**Configuration:**
- `tailwind.config.ts`: Design tokens (colors, fonts, spacing)
- `src/app/globals.css`: Tailwind layers, custom components, scrollbar
- `tsconfig.json`: TypeScript strict mode and path alias `@/*` → `./src/*`
- `src/i18n.ts`: Locale validation and message loading

**Core Logic:**
- `src/components/layout/header.tsx`: Language switching, theme toggle, navigation (127 lines, state-based menu)
- `src/components/sections/*.tsx`: Individual page sections with Framer Motion animations

**Internationalization:**
- `messages/en.json`: English translations (namespaced: nav, hero, features, pricing, etc.)
- `messages/pt-BR.json`: Portuguese-BR translations (same structure)

**Styling:**
- `src/app/globals.css`: Tailwind directives, custom components (.container-custom, .btn-primary, etc.), dark mode setup
- `tailwind.config.ts`: Color palette (primary grays, accent indigo, metallic), font families (Inter, Poppins)

## Naming Conventions

**Files:**
- Page/Layout: PascalCase with .tsx (e.g., `page.tsx`, `layout.tsx`)
- Components: PascalCase (e.g., `Hero.tsx`, `Features.tsx`)
- Utilities: camelCase (e.g., `utils.ts`, `i18n.ts`)
- Directories: kebab-case (e.g., `src/components/ui/`, `src/components/sections/`)

**Functions & Constants:**
- Component names: PascalCase (`function Hero()`, `export function Features()`)
- Utility functions: camelCase (`export function cn()`)
- Constants: camelCase for arrays/objects (`const featureIcons = []`, `const planConfig = {}`)
- Hook imports: use pattern (`const t = useTranslations()`, `const locale = useLocale()`)

**Types & Interfaces:**
- No explicit interfaces visible in source (uses implicit React.ReactNode, etc.)
- Locale type: `type Locale = (typeof locales)[number]`

## Where to Add New Code

**New Section/Feature:**
- Primary code: `src/components/sections/[feature-name].tsx`
- Import pattern: Use 'use client' directive, `useTranslations()` for i18n, Framer Motion for animations
- Add to page: Import section in `src/app/[locale]/page.tsx`, add in sequence
- Translations: Add namespace in `messages/en.json` and `messages/pt-BR.json`

**New Component/Module:**
- Reusable UI: `src/components/ui/[component-name].tsx`
- Layout component: `src/components/layout/[component-name].tsx`
- Business logic: `src/lib/[feature-name].ts`

**Utilities & Helpers:**
- Shared functions: `src/lib/utils.ts`
- Constants: Define in component file or `src/lib/constants.ts` (create if needed)
- Hooks: Create `src/hooks/[hook-name].ts` (directory doesn't exist yet)

**Styling & Design Tokens:**
- Global styles: Modify `src/app/globals.css`
- Theme colors: Update `tailwind.config.ts` (colors object)
- Font changes: Update `tailwind.config.ts` (fontFamily object)
- Custom components: Add to `@layer components` in `globals.css`

**Translations:**
- Always add to both `messages/en.json` and `messages/pt-BR.json`
- Use namespace pattern: `t('section.key')`
- Example structure:
  ```json
  {
    "featureName": {
      "title": "...",
      "description": "..."
    }
  }
  ```

## Special Directories

**node_modules/:**
- Purpose: npm dependencies (React, Next.js, Tailwind, Framer Motion, etc.)
- Generated: Yes (via npm install)
- Committed: No (in .gitignore)

**.next/:**
- Purpose: Next.js build output and cache
- Generated: Yes (via npm run build or dev server)
- Committed: No (in .gitignore)

**messages/:**
- Purpose: JSON translation files for i18n
- Generated: No (manually created and edited)
- Committed: Yes (source of translations)

**public/:**
- Purpose: Static assets served as-is
- Generated: No
- Committed: Yes (images, favicons, etc.)

**.planning/codebase/:**
- Purpose: Development documentation
- Generated: No (manually created)
- Committed: Yes (reference for future work)

## File Path Examples

**Adding a new testimonial section variant:**
- Location: Create or modify `src/components/sections/testimonials.tsx`
- Translations: Add to `messages/en.json` under `testimonials` namespace
- Import: Already imported in `src/app/[locale]/page.tsx`

**Adding a new utility function:**
- Location: Add to `src/lib/utils.ts`
- Usage: Import as `import { newUtil } from '@/lib/utils'`

**Adding theme colors:**
- Location: `tailwind.config.ts` in `theme.extend.colors`
- Usage: Apply via Tailwind classes, e.g., `bg-newColor-500`

**Adding a new layout:**
- Location: `src/components/layout/[name].tsx`
- Import: In `src/app/[locale]/layout.tsx` or specific page

---

*Structure analysis: 2026-01-26*
