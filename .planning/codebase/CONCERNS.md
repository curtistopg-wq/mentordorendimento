# Codebase Concerns

**Analysis Date:** 2026-01-26

## Tech Debt

**Hardcoded Values and Magic Numbers:**
- Issue: Multiple hardcoded values scattered across components instead of centralized constants
- Files: `src/components/sections/stats.tsx`, `src/components/sections/pricing.tsx`, `src/components/layout/header.tsx`, `src/components/sections/testimonials.tsx`
- Impact: Changes to pricing, stat counts, language options require editing multiple files. Increases bug risk and maintenance overhead.
- Fix approach: Create `src/lib/constants.ts` with centralized config for planKeys, statValues, languages, testimonialKeys, accordionKeys

**Inline Styling and Undefined CSS Classes:**
- Issue: Heavy reliance on inline styles with `backgroundImage` and hardcoded color filters instead of CSS classes
- Files: `src/components/sections/hero.tsx` (line 14-20), `src/components/sections/features.tsx` (line 33-38), `src/components/sections/courses-accordion.tsx` (line 21-25), `src/components/sections/testimonials.tsx` (line 81-85)
- Impact: Difficult to maintain, inconsistent image handling, no reusable image background component pattern
- Fix approach: Create reusable `<ImageBackground>` component wrapping the inline style pattern, or define CSS utility classes for common background patterns

**Missing CSS Custom Class Usage:**
- Issue: `container-custom` and `section-padding` classes defined in `src/app/globals.css` but not applied consistently across all sections
- Files: `src/components/sections/hero.tsx` (uses container-custom), `src/components/sections/courses-accordion.tsx` (line 15, uses py-0 inline), `src/components/sections/stats.tsx` (line 65, uses py-20 inline)
- Impact: Inconsistent vertical spacing, harder to maintain responsive padding strategy
- Fix approach: Use `section-padding` consistently or create a `<Section>` wrapper component

**Unimplemented Theme Toggle:**
- Issue: Moon button in header (`src/components/layout/header.tsx` line 115-120) has no onClick handler
- Files: `src/components/layout/header.tsx` (line 115)
- Impact: Theme toggle button appears functional but does nothing, confuses users, poor UX
- Fix approach: Connect button to `next-themes` useTheme hook and implement toggle logic

**Unimplemented User Account Button:**
- Issue: User account button (`src/components/layout/header.tsx` line 123-128) has no onClick handler or navigation
- Files: `src/components/layout/header.tsx` (line 123)
- Impact: Button appears clickable but has no functionality
- Fix approach: Add navigation to `/account` route or implement login modal

## Performance Bottlenecks

**Intersection Observer Not Cleaned Up in Stats Component:**
- Issue: Counter component sets up intersection observer without cleanup in one branch
- Files: `src/components/sections/stats.tsx` (line 17-32)
- Impact: Memory leak potential if multiple counter instances are created/destroyed, especially in server-side rendering scenarios
- Improvement path: Ensure observer is always removed in useEffect cleanup, regardless of isInView state

**Image Fallback Rendering:**
- Issue: Testimonial images use inline `backgroundImage` URLs without Next.js Image optimization or fallbacks
- Files: `src/components/sections/testimonials.tsx` (line 82-85), `src/components/sections/hero.tsx` (line 14), `src/components/sections/features.tsx` (line 34), `src/components/sections/courses-accordion.tsx` (line 22)
- Impact: No lazy loading, no image optimization, no responsive image serving, full file sizes downloaded for all devices
- Improvement path: Use Next.js `Image` component, implement proper lazy loading, add error boundaries for missing images

**Multiple Re-renders from State Changes:**
- Issue: Accordion components set state on click without debouncing or memoization
- Files: `src/components/sections/faq.tsx`, `src/components/sections/courses-accordion.tsx`
- Impact: Rapid clicking could cause animation flicker or performance hiccups
- Improvement path: Add `useCallback` memoization and consider debouncing state updates

**Inefficient Animation Config Duplication:**
- Issue: Framer Motion variants (container, item) are redefined in multiple components instead of being imported from shared location
- Files: `src/components/sections/features.tsx` (line 10-23), `src/components/sections/testimonials.tsx` (line 15-28), `src/components/sections/courses-accordion.tsx` (line 66)
- Impact: Inconsistent animation timings across page, larger bundle size, harder to maintain animation consistency
- Improvement path: Create `src/lib/animations.ts` with shared animation variants, import and reuse

## Fragile Areas

**Dynamic Translation String Building:**
- Issue: Translation keys are constructed dynamically using template literals with hard-coded indices
- Files: `src/components/sections/pricing.tsx` (line 41-42), `src/components/sections/testimonials.tsx` (line 60, 74, 97), `src/components/sections/stats.tsx` (line 98), `src/components/sections/features.tsx` (line 86-90)
- Why fragile: If translation JSON structure changes (e.g., feature count), runtime errors will occur with no compile-time checking. Missing translation keys result in blank UI
- Safe modification: Use TypeScript types to validate translation key structure, validate feature counts match actual array lengths, add type-safe translation helpers
- Test coverage: No tests to verify translation key existence or structure correctness

**Hardcoded Array Indices for Icon Mapping:**
- Issue: Icon arrays must maintain exact synchronization with feature/stat arrays
- Files: `src/components/sections/features.tsx` (line 7, 72), `src/components/sections/stats.tsx` (line 8-10, 69-70)
- Why fragile: Reordering features or adding new ones without updating icon array causes wrong icon rendering or crashes
- Safe modification: Use object-based configuration instead of parallel arrays, or add validation to ensure array lengths match
- Test coverage: No tests verifying icon-to-feature synchronization

**Missing Error Boundaries:**
- Issue: No error boundaries wrapping client components that fetch translations or render conditional content
- Files: All `src/components/sections/*.tsx` files using `useTranslations`
- Impact: Single translation loading failure or locale error crashes entire page
- Fix approach: Add React error boundary wrapper around each section

**Footer Links Mismatch:**
- Issue: Footer defines link objects with `key` and `href`, but uses hardcoded translation keys that may not exist
- Files: `src/components/layout/footer.tsx` (line 6-17, line 58-87)
- Why fragile: If translation keys like `links.refund`, `links.terms` don't exist in JSON, footer links show blank text
- Test coverage: No tests verifying all footer link translations exist

## Testing Coverage Gaps

**No Unit Tests:**
- What's not tested: Counter animation behavior, intersection observer logic, locale switching, theme toggle
- Files: `src/components/sections/stats.tsx` (Counter component), `src/components/layout/header.tsx` (switchLocale function)
- Risk: Theme toggle won't work when implemented, locale switching edge cases unreachable, counter animations may break on mobile
- Priority: High - Counter and locale switching are core functionality

**No Integration Tests:**
- What's not tested: Page renders with all sections and correct locales, translations load for both languages, responsive layout on mobile
- Files: `src/app/[locale]/page.tsx`, `src/app/[locale]/layout.tsx`
- Risk: Silent layout breakage, missing translations in production, locale-specific bugs undetected
- Priority: High - User-facing impact

**No E2E Tests:**
- What's not tested: Mobile menu open/close, accordion expand/collapse, language switching navigation, scroll-to-top button visibility and functionality
- Risk: Interaction bugs like menu not closing after navigation, accordions getting stuck open, scroll-to-top button appearing inappropriately
- Priority: Medium - User experience impact but less critical than core functionality

**No Accessibility Tests:**
- What's not tested: Keyboard navigation, ARIA labels sufficiency, focus management in modals/accordions, color contrast ratios
- Files: `src/components/layout/header.tsx`, `src/components/sections/faq.tsx`, `src/components/sections/courses-accordion.tsx`
- Risk: WCAG 2.1 non-compliance, keyboard users unable to navigate, screen reader users missing context
- Priority: High - Legal and ethical concern

## Scaling Limits

**Translation File Growth:**
- Current approach: Separate JSON files per locale imported at build time
- Limitation: As content grows, JSON parsing at build time will slow compilation
- Scaling issue: No i18n provider backend integration; all translations must be bundled
- Scaling path: Implement i18n backend (Crowdin, Lokalise) for dynamic translation loading, or lazy-load translation chunks per page

**Static Component Configuration:**
- Issue: Pricing plans, features, stats all hardcoded as const in component files
- Current capacity: Works fine with 3 pricing tiers, 3-4 features, 4 stats
- Limit: When you need to add plan tiers dynamically or manage pricing from a CMS, requires code changes
- Scaling path: Move config to `src/lib/config.ts` or create a simple JSON config file, eventually migrate to CMS/database

**Image Placeholder System:**
- Issue: All images use inline placeholder gradients with no image management system
- Current capacity: Static images referenced directly (e.g., `/images/hero-bg.jpg`)
- Limit: No CDN integration, no image optimization, no image variants for different screen sizes
- Scaling path: Implement image optimization pipeline (Next.js Image), use CDN for image serving, implement lazy loading

## Missing Critical Features

**No Contact Form Backend:**
- Problem: CTA section and footer have contact links pointing to `#contact` but no actual contact form or submission handler
- Blocks: Cannot collect user inquiries or email signups
- Files: `src/components/sections/cta.tsx` (likely missing, not found in codebase)
- Impact: Marketing funnel incomplete, leads cannot be captured

**No Authentication System:**
- Problem: "User Account" button and links to `/account` page don't have authentication implemented
- Blocks: Cannot track users, verify purchases, gate premium content
- Impact: Course access control not implemented, no user state management

**No Payment Integration:**
- Problem: Pricing section has CTA buttons but no payment processor integration (Stripe, PayPal)
- Blocks: Cannot process actual transactions
- Impact: Landing page is non-functional for actual sales

**No 404 or Error Pages:**
- Problem: Footer links to `/refund`, `/terms`, `/privacy`, `/account` but these pages likely don't exist
- Blocks: 404 errors when users click footer links
- Impact: Poor user experience, broken footer navigation

## Dependencies at Risk

**React 18 Version Pinning:**
- Risk: React pinned to `^18` (not `^19`) - may miss important updates
- Impact: Security patches, performance improvements in React 18.x releases may not be applied
- Recommendation: Review and update to latest React 18 or evaluate migration to React 19 if compatible

**Framer Motion Major Version:**
- Risk: `framer-motion ^11.15.0` has significant breaking changes between major versions
- Impact: Cannot update to next major version without code refactoring
- Recommendation: Plan migration path to Framer Motion 12+ when released, monitor for security updates in v11

**Next.js Version 14.2.21:**
- Risk: Version specified as `14.2.21` (older patch version of v14)
- Impact: May be missing bug fixes and performance improvements from latest 14.x or 15.x
- Recommendation: Update to latest Next.js 14 LTS or evaluate migration to 15 for new features

## Security Considerations

**Potential XSS in Translation Keys:**
- Risk: Translation values containing HTML are rendered as-is
- Files: `src/components/sections/faq.tsx` (line 75), `src/components/sections/features.tsx` (line 86-90)
- Current mitigation: next-intl library escapes by default
- Recommendations: Add Content Security Policy headers, audit translation JSON for script injection, add XSS tests

**Missing Environment Variable Validation:**
- Risk: No `.env.example` file showing required environment variables
- Impact: Deployment without required config (e.g., API keys if added later) may fail silently
- Recommendations: Create `.env.example`, add environment validation at build time, use `zod` for schema validation

**Hardcoded Support Email:**
- Risk: `support@mestresdorendimento.com` exposed in footer (potential spam target)
- Files: `src/components/layout/footer.tsx` (line 46)
- Recommendations: Consider email obfuscation, rate limit if it becomes spam target, use contact form instead of direct email

**No CORS Configuration:**
- Risk: If backend API is added, CORS headers not configured
- Impact: Cross-origin requests from frontend may be blocked
- Recommendations: Document CORS requirements, configure Next.js API routes with proper CORS headers

## Known Issues Summary

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| Theme toggle button non-functional | Medium | `header.tsx` | Unimplemented |
| User account button non-functional | Medium | `header.tsx` | Unimplemented |
| No contact form backend | High | `cta.tsx` | Missing |
| Missing auth system | High | Global | Not implemented |
| Missing payment integration | Critical | `pricing.tsx` | Not implemented |
| Missing `/refund`, `/terms`, `/privacy` pages | High | Footer links | Not created |
| Missing error boundaries | Medium | All sections | Not added |
| Image optimization missing | Medium | All image sections | Not optimized |
| Hardcoded config values | Low | Multiple files | Scattered |
| No unit/integration tests | High | All components | Not written |

---

*Concerns audit: 2026-01-26*
