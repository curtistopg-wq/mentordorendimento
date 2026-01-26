# Coding Conventions

**Analysis Date:** 2026-01-26

## Naming Patterns

**Files:**
- Component files (both UI and sections): lowercase with hyphens (`hero.tsx`, `header.tsx`, `courses-accordion.tsx`)
- Utility/library files: lowercase with hyphens (`scroll-to-top.tsx`, `theme-provider.tsx`)
- Configuration files: conventional (tsconfig.json, package.json, tailwind.config.ts)
- i18n configuration: `i18n.ts` at root of `src/`

**Functions and Components:**
- React components: PascalCase (`Hero`, `Header`, `Features`, `CTA`)
- Helper functions: camelCase (`switchLocale`, `getMessages`)
- Constant arrays/objects: camelCase (`languages`, `navigation`, `featureIcons`, `planConfig`)
- Type imports: type keyword used explicitly (`import type { ... }`)

**Variables:**
- Component state: camelCase (`mobileMenuOpen`, `langMenuOpen`, `openIndex`)
- Constants: camelCase for data structures, UPPERCASE for immutable collections of configs
- Translations keys: nested path notation (`t('nav')`, `t('items.${key}.title')`)

**Types:**
- React prop types: defined inline with `interface ComponentProps` pattern
- Exported types: use `as const` for type-safe string literals (`const featureKeys = ['education', 'innovation', 'community'] as const`)

## Code Style

**Formatting:**
- No explicit Prettier config found; inferred style:
  - Single quotes for imports/strings
  - Semicolons present
  - 2-space indentation (inferred from file consistency)
  - Consistent use of trailing commas in arrays/objects
- Tailwind CSS classes ordered logically (layout → sizing → colors → effects)

**Linting:**
- ESLint configured via `eslint-config-next` (Next.js 14.2.21 default rules)
- No custom .eslintrc file found; uses Next.js defaults
- `@types/node`, `@types/react`, `@types/react-dom` enforcing strict TypeScript

**TypeScript:**
- Strict mode enabled (`"strict": true`)
- `noEmit: true` - type checking without emitting JS
- Module resolution: `bundler`
- Path aliases configured: `@/*` maps to `./src/*`

## Import Organization

**Order:**
1. External packages (React, Next.js, third-party libraries)
2. Icons from lucide-react
3. Utilities from next-intl
4. Local utilities from `@/lib/utils`
5. Local components from relative or aliased paths

**Path Aliases:**
- `@/lib/utils` - utility functions (`cn` for classname merging)
- `@/components/...` - component imports
- `@/components/sections/...` - page section components
- `@/components/layout/...` - layout components (Header, Footer)
- `@/components/ui/...` - reusable UI components
- Relative imports used for co-located components

**Barrel Files:**
- Not extensively used; components imported directly from their file paths
- No index.ts files creating re-exports found in components directory

## Error Handling

**Patterns:**
- `notFound()` from `next/navigation` used for invalid locales in `i18n.ts` (line 10)
- Type guards: conditional checks before accessing (e.g., `locale === lang.code`)
- Try-catch: not visible in examined files; likely handled at API layer (not present in frontend components)
- Fallback rendering: placeholder divs used when images missing (see testimonials, courses accordion)
- Null coalescing: `languages.find(l => l.code === locale) || languages[0]` pattern

## Logging

**Framework:** console not used in examined files

**Patterns:**
- No explicit logging framework detected
- No console.log, console.error statements in components
- Debugging: relies on React DevTools and browser dev tools
- Build-time logging: Next.js build process for warnings

## Comments

**When to Comment:**
- Minimal commenting observed; code is self-documenting
- Section headers used sparingly (e.g., `{/* Background Image */}`, `{/* Navigation Bar */}`)
- Comments explain visual layout, not logic

**JSDoc/TSDoc:**
- Not used in examined codebase
- Function signatures use TypeScript for documentation (interfaces, type annotations)

## Function Design

**Size:**
- Small, focused functions (8-60 lines typical)
- Large components composed from smaller motion/layout sections
- Average section component: 50-100 lines

**Parameters:**
- Destructured component props: `{ className, children }: ComponentProps`
- Named parameters preferred over positional
- Callback functions: `onClick={() => setOpenIndex(...)}`
- Hook parameters: `useTranslations('key')` injected at component level

**Return Values:**
- React components return JSX.Element
- Utility functions: `cn` returns merged className string
- Hooks: return state, setters, or utilities
- Conditional rendering: ternary operators inline, motionAnimatePresence for conditional display

## Module Design

**Exports:**
- Named exports for all components: `export function ComponentName()`
- Single export per file is standard
- Types exported with `export type`

**Barrel Files:**
- Minimal barrel pattern; imports use direct paths
- Example: `import { Hero } from '@/components/sections/hero'` rather than `from '@/components/sections'`

## Animation Conventions

**Framer Motion:**
- All animations use consistent easing: `[0.65, 0, 0.35, 1]` (custom cubic-bezier)
- Duration: 0.3-0.6s typical for fast transitions, 0.6-1s for slower reveals
- Stagger pattern: `staggerChildren: 0.1-0.15` for grid items
- Viewport triggers: `viewport={{ once: true }}` standard for scroll animations
- Entry animations: opacity and transform (y, x) combined

**Pattern Example from features.tsx:**
```typescript
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}
```

## Tailwind CSS Patterns

**Custom Classes:**
- `container-custom` for max-width container with responsive padding
- `section-padding` for consistent vertical spacing (py-16 md:py-24)
- `btn-primary`, `btn-secondary` for button variants
- `card` for card components
- `text-gradient` for gradient text effect

**Color System:**
- Primary color scale: 50-900 (light to dark)
- Accent colors: `accent`, `accent-light`, `accent-dark` for brand highlights
- Special colors: `gold`, `silver`, `platinum` for pricing tiers
- Dark mode: `dark:` prefix used consistently throughout

**Responsive Pattern:**
- Mobile-first approach: base styles → `md:` tablet → `lg:` desktop
- Tailwind responsive prefixes: `md:`, `lg:`
- Full-width sections with `w-full`, max-width containers with `max-w-*`

## Translation (i18n) Patterns

**Setup:** next-intl library with locale routing `[locale]` dynamic segment

**Usage Pattern:**
```typescript
const t = useTranslations('namespace')
// In JSX: {t('key')}, {t('items.${key}.title')}, {t(`items.${key}.description`)}
```

**File Organization:**
- JSON translation files in `messages/` directory (referenced in `i18n.ts`)
- Locale support: `en`, `pt-BR`
- Default locale: `en`
- Locale validation: `notFound()` if invalid locale in URL

## Data Structure Patterns

**Constant Mapping:**
- Icons mapped to keys: `const featureIcons = [FolderOpen, User, MessageCircle]`
- Feature keys: `const featureKeys = ['education', 'innovation', 'community'] as const`
- Navigation items: array of objects `{ name, href }`
- Pricing tiers: config object with variant, price, features

**Type-Safe Lookups:**
- Using `const` assertion for literal types
- Index-based mapping: `featureIcons[index]` paired with `featureKeys.map()`
- Config lookup: `planConfig[planKey]` where key type matches union of keys

---

*Convention analysis: 2026-01-26*
