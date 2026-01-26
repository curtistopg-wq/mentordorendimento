# Technology Stack

**Analysis Date:** 2026-01-26

## Languages

**Primary:**
- TypeScript 5.x - Used throughout the codebase for type safety
- JavaScript (JSX/TSX) - React components and pages

**Secondary:**
- JSON - Internationalization messages and configuration

## Runtime

**Environment:**
- Node.js (version specified in package.json, uses ES modules)

**Package Manager:**
- npm (v7+)
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 14.2.21 - Full-stack React framework with App Router
- React 18 - UI component library
- TypeScript 5.x - Type safety and development experience

**Internationalization:**
- next-intl 3.22.0 - Multi-language support (English, Portuguese-BR)

**Styling:**
- Tailwind CSS 3.4.1 - Utility-first CSS framework
- PostCSS 8.x - CSS processing

**Animations:**
- Framer Motion 11.15.0 - React animation library for motion components

**UI & Utilities:**
- lucide-react 0.469.0 - Icon library
- next-themes 0.4.4 - Dark/Light theme management
- clsx 2.1.1 - Conditional CSS class utilities
- tailwind-merge 2.6.0 - Merge Tailwind CSS classes safely

**Build & Dev:**
- Autoprefixer 10.4.23 - CSS vendor prefixing
- ESLint 8.x - Code quality and linting
- eslint-config-next 14.2.21 - Next.js ESLint configuration

## Key Dependencies

**Critical:**
- framer-motion 11.15.0 - Provides motion/animation capabilities for scroll triggers and component animations
- next-intl 3.22.0 - Enables multi-language support with server-side message loading

**Infrastructure:**
- next-themes 0.4.4 - Theme switching infrastructure for dark/light mode
- lucide-react 0.469.0 - SVG icon library used throughout UI components

## Configuration

**Environment:**
- Environment configuration handled via environment variables
- Next.js configuration in `next.config.mjs` with next-intl plugin
- No `.env` files found in repository (use environment variables for deployment)

**Build:**
- `next.config.mjs` - Next.js configuration with next-intl plugin
- `tsconfig.json` - TypeScript compiler settings with path aliases (`@/*` → `src/*`)
- `tailwind.config.ts` - Tailwind CSS customization with custom color palette
- `postcss.config.mjs` - PostCSS configuration for CSS processing
- `eslint.config.js` - Linting rules via next/lint

**TypeScript Configuration:**
- Strict mode enabled
- Paths: `@/*` resolves to `src/*`
- JSX: preserve (handled by Next.js)
- Module resolution: bundler

## Tailwind Configuration Details

**Custom Color Palette:**
- `primary`: Grayscale palette (primary-50 to primary-900) with base #4a5568
- `accent`: Indigo-based (#5c6bc0) with light and dark variants
- `gold`: #d4af37 (luxury brand accent)
- `silver`: #c0c0c0
- `platinum`: #e5e4e2

**Typography:**
- `sans`: Inter, system-ui fallback
- `display`: Poppins, system-ui fallback
- Dark mode support via `darkMode: 'class'`

**Container:**
- Centered container with responsive padding
- Breakpoints: default (1rem), sm (2rem), lg (4rem), xl (5rem)

## Internationalization Setup

**Supported Locales:**
- English (`en`) - Default
- Portuguese Brazil (`pt-BR`)

**Implementation:**
- Middleware in `middleware.ts` routes requests to localized pages
- Messages loaded from `messages/{locale}.json` at build time
- Server-side message loading via `getMessages()` from next-intl/server
- Locale prefix always applied in URLs

**Message Files:**
- `messages/en.json` - English translations
- `messages/pt-BR.json` - Portuguese-Brazil translations

## Platform Requirements

**Development:**
- Node.js (ES module support required)
- npm or compatible package manager
- TypeScript knowledge recommended
- Modern browser with ES2020+ support

**Production:**
- Node.js runtime for server
- Next.js deployment target (Vercel recommended, or self-hosted)
- Build output: `.next/` directory

**Browser Support:**
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Dark/Light theme support via CSS custom properties

## Scripts

```bash
npm run dev      # Next.js development server (port 3000)
npm run build    # Production build
npm start        # Production server
npm run lint     # ESLint code quality check
```

---

*Stack analysis: 2026-01-26*
