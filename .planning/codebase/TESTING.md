# Testing Patterns

**Analysis Date:** 2026-01-26

## Test Framework

**Runner:**
- Not configured; no test runner present in project

**Assertion Library:**
- Not present

**Run Commands:**
```bash
npm run lint              # Type check and linting only
npm run build             # Build Next.js app
npm run dev               # Development server
```

**Status:** No testing infrastructure currently implemented.

## Test File Organization

**Location:**
- Not applicable; no test files present in `src/` directory

**Naming:**
- No test files found (searched for `*.test.*` and `*.spec.*`)

**Structure:**
- Not applicable

## Test Structure

**Suite Organization:**
- Not applicable; no tests implemented

**Patterns:**
- Not applicable

## Mocking

**Framework:**
- Not implemented

**Patterns:**
- Not applicable

**What to Mock:**
- Not applicable

**What NOT to Mock:**
- Not applicable

## Fixtures and Factories

**Test Data:**
- Static data used in components for demonstration (e.g., language options, FAQs, testimonials)
- Example from `header.tsx`:
  ```typescript
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
  ]
  ```
- Example from `faq.tsx` (static FAQ data):
  ```typescript
  const faqs = [
    { question: '...', answer: '...' },
    // ... more FAQs
  ]
  ```

**Location:**
- Hardcoded in component files
- No centralized fixtures directory

## Coverage

**Requirements:** None enforced

**View Coverage:**
- Not applicable (no test runner)

## Test Types

**Unit Tests:**
- Not implemented

**Integration Tests:**
- Not implemented

**E2E Tests:**
- Not implemented (no Playwright, Cypress, or similar configured)

## Testing Approach & Recommendations

### Current State

The project has **zero testing infrastructure**. No unit tests, integration tests, or e2E tests are present.

**Why This Matters:**
- Risk when refactoring animations or translations
- Hard to catch locale switching bugs
- Component state changes (mobile menu, language dropdowns) untested
- No validation of Tailwind responsive behavior across breakpoints

### Areas That Should Be Tested

**Priority: HIGH**

1. **Internationalization (i18n)**
   - Locale routing and validation (`src/i18n.ts`)
   - Translation key resolution
   - Language switching in header component
   - Risk: Missing translations, broken locale paths
   - Impact: Users on wrong locale, UI text fallbacks

2. **Component State Management**
   - Header: mobile menu toggle, language dropdown open/close
   - FAQ/Accordion: item expand/collapse state
   - Risk: Mobile navigation broken, no way to close dropdowns
   - Impact: Mobile UX completely broken

3. **Framer Motion Animations**
   - Viewport triggers (`whileInView`, `once: true`)
   - Stagger children sequences
   - Risk: Animation jank, failed reveals on scroll
   - Impact: Loading experience degrades, animations fail silently

4. **Responsive Layout**
   - Grid breakpoints (md:, lg:)
   - Container padding adjustments
   - Mobile menu visibility
   - Risk: Layout broken on specific viewports
   - Impact: Users on tablets/phones see broken layout

5. **Translation Key Resolution**
   - Nested path resolution: `t('plans.${planKey}.features.${i}')`
   - Missing key fallback behavior
   - Risk: Undefined keys show raw strings
   - Impact: Poor UX with "plans.undefined.features.0"

### Suggested Testing Strategy

**Phase 1: Unit Tests (Jest + React Testing Library)**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npx jest --init
```

**Example test for Header language switching:**
```typescript
// src/components/layout/header.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from './header'

describe('Header Language Switching', () => {
  it('should switch locale when language button clicked', () => {
    // Mock next-intl and next/navigation hooks
    // Verify switchLocale called with correct locale
  })

  it('should close language dropdown after selection', () => {
    // Verify langMenuOpen state set to false
  })

  it('should toggle mobile menu on button click', () => {
    // Verify mobileMenuOpen state toggles
  })
})
```

**Phase 2: Component Integration Tests**
```typescript
// Test i18n + Header together
// Verify locale changes update all translation keys
```

**Phase 3: E2E Tests (Playwright)**
```typescript
// src/tests/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test'

test('language switching persists across pages', async ({ page }) => {
  await page.goto('/en')
  await page.click('[aria-label="Portuguese"]')
  // Wait for navigation to /pt-BR
  expect(page.url()).toContain('pt-BR')
})

test('mobile menu opens and closes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.click('[aria-label="Toggle menu"]')
  await expect(page.locator('[role="navigation"]')).toBeVisible()
})
```

### Current Test Gaps

| Component | Test Status | Risk Level |
|-----------|------------|-----------|
| `Header` (mobile menu, locale switch) | ❌ Not tested | HIGH |
| `i18n.ts` (locale validation) | ❌ Not tested | HIGH |
| `Hero`, `Features`, `CTA` (animations) | ❌ Not tested | MEDIUM |
| `FAQ`, `Accordion` (state management) | ❌ Not tested | MEDIUM |
| `Pricing` (dynamic feature lists) | ❌ Not tested | MEDIUM |
| `utils.cn()` (classname merging) | ❌ Not tested | LOW |
| `ThemeProvider` wrapper | ❌ Not tested | LOW |
| `ScrollToTop` functionality | ❌ Not tested | LOW |

### Styling for Tests

Once test framework is implemented, follow these patterns:

**Test file location:** Co-locate with source
```
src/components/layout/
├── header.tsx
└── header.test.tsx
```

**Test naming:** Descriptive, user-centric
```typescript
describe('Header', () => {
  it('should display navigation links for all locales', () => {})
  it('should toggle mobile menu on small screens', () => {})
  it('should update URL when switching language', () => {})
})
```

**Mock patterns for this codebase:**
```typescript
// Mock next-intl hooks
jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key,
  useLocale: () => 'en',
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/en',
}))
```

---

*Testing analysis: 2026-01-26*
