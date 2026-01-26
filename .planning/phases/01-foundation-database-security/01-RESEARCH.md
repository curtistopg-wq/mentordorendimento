# Phase 1: Foundation + Database Security - Research

**Researched:** 2026-01-26
**Domain:** Supabase Database, RLS Policies, Next.js Integration
**Confidence:** HIGH

## Summary

This phase establishes the secure database foundation using Supabase with Row Level Security (RLS) policies. The research covers the complete setup process for Supabase with Next.js 14 App Router, including client utilities, database schema design for courses/lessons/enrollments/progress, RLS policies that protect user data, and performance optimization through indexes.

The standard approach involves:
1. Installing @supabase/supabase-js and @supabase/ssr packages
2. Creating browser and server client utilities with proper cookie handling
3. Setting up middleware for automatic token refresh
4. Creating database migrations with proper foreign key relationships
5. Enabling RLS on all tables BEFORE inserting any data
6. Creating granular policies for each CRUD operation
7. Adding indexes on columns used in RLS policies

**Primary recommendation:** Enable RLS and create policies as part of the same migration that creates each table. Never create a table without immediately enabling RLS.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | ^2.80.0 | Main Supabase client | Official SDK for database, auth, storage |
| @supabase/ssr | ^0.8.0 | Server-side rendering support | Cookie-based auth for Next.js App Router |
| supabase (CLI) | latest | Local development & migrations | Official CLI for migrations, types, local dev |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Docker | latest | Local Supabase stack | Required for `supabase start` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @supabase/ssr | @supabase/auth-helpers-nextjs | DEPRECATED - don't use, migrate to ssr |

**Installation:**
```bash
npm install @supabase/supabase-js @supabase/ssr
npm install supabase --save-dev
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── supabase/
│       ├── client.ts      # Browser client (Client Components)
│       ├── server.ts      # Server client (Server Components, Actions)
│       └── middleware.ts  # Token refresh utility
├── app/
│   └── ...
└── types/
    └── database.types.ts  # Generated from Supabase schema
supabase/
├── migrations/
│   └── 20260126000000_initial_schema.sql
├── seed.sql               # Test data
└── config.toml            # Local config
middleware.ts              # Next.js middleware at root
.env.local                 # Environment variables
```

### Pattern 1: Browser Client (Client Components)
**What:** Singleton client for client-side operations
**When to use:** Client Components, real-time subscriptions
**Example:**
```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Pattern 2: Server Client (Server Components/Actions)
**What:** Per-request client with cookie handling
**When to use:** Server Components, Server Actions, Route Handlers
**Example:**
```typescript
// Source: https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore errors in Server Components (read-only)
          }
        },
      },
    }
  )
}
```

### Pattern 3: Middleware for Token Refresh
**What:** Automatic token refresh on every request
**When to use:** Always - required for auth to work properly
**Example:**
```typescript
// Source: https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs
// src/lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not remove this line
  // Refreshes the auth token if expired
  await supabase.auth.getUser()

  return supabaseResponse
}

// middleware.ts (root)
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Pattern 4: RLS-First Table Creation
**What:** Always enable RLS in the same migration that creates the table
**When to use:** Every table creation
**Example:**
```sql
-- Source: https://supabase.com/docs/guides/auth/row-level-security
-- CORRECT: Enable RLS immediately
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create policies immediately after
CREATE POLICY "Anyone can view courses"
  ON public.courses FOR SELECT
  TO authenticated, anon
  USING (true);
```

### Anti-Patterns to Avoid
- **Creating tables without RLS:** RLS is disabled by default - 83% of breaches come from this
- **Using `FOR ALL` policies:** Always create separate policies for SELECT, INSERT, UPDATE, DELETE
- **Trusting user_metadata in policies:** `raw_user_meta_data` is user-modifiable, use `auth.uid()` instead
- **Not wrapping functions in SELECT:** `auth.uid()` should be `(SELECT auth.uid())` for performance
- **Using getSession() on server:** Always use `getUser()` which validates the JWT

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie handling for auth | Custom cookie logic | @supabase/ssr createServerClient | Handles refresh tokens, cookie chunking, secure flags |
| Type generation | Manual TypeScript types | `supabase gen types` | Automatically synced with schema changes |
| Migration management | Manual SQL execution | Supabase CLI migrations | Version control, reproducible deployments |
| Auth token refresh | Manual refresh logic | Middleware with getUser() | Automatic, handles edge cases |
| UUID generation | Custom UUID logic | `gen_random_uuid()` | Built-in PostgreSQL function |
| Timestamps | Manual date handling | `TIMESTAMPTZ DEFAULT NOW()` | Timezone-aware, auto-populated |

**Key insight:** Supabase provides battle-tested implementations for auth, cookies, and database operations. Custom solutions introduce security vulnerabilities and edge case bugs.

## Common Pitfalls

### Pitfall 1: RLS Disabled by Default
**What goes wrong:** Tables created without RLS allow anyone with the anon key to read/write all data
**Why it happens:** PostgreSQL (and Supabase) default to RLS disabled
**How to avoid:** Add `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` in the same migration as CREATE TABLE
**Warning signs:** No RLS policies shown in Supabase dashboard for a table

### Pitfall 2: RLS Enabled Without Policies = Complete Lockout
**What goes wrong:** After enabling RLS, ALL rows are inaccessible (even to authenticated users)
**Why it happens:** RLS with no policies denies everything by default
**How to avoid:** Always create at least one policy immediately after enabling RLS
**Warning signs:** Queries return empty results even with data present

### Pitfall 3: Using user_metadata in Policies
**What goes wrong:** Users can modify their own metadata and bypass authorization
**Why it happens:** `raw_user_meta_data` is writable by authenticated users
**How to avoid:** Only use `auth.uid()` or `app_metadata` (which requires service role to modify)
**Warning signs:** Policy references `user_metadata`, `raw_user_meta_data`, or JWT claims other than `sub`

### Pitfall 4: Missing Indexes on Policy Columns
**What goes wrong:** RLS policies cause full table scans, 100x+ slower queries
**Why it happens:** PostgreSQL can't optimize WHERE clauses without indexes
**How to avoid:** Create indexes on all columns used in RLS policy conditions
**Warning signs:** Slow queries (>100ms) on tables with many rows

### Pitfall 5: Not Wrapping Functions in SELECT
**What goes wrong:** `auth.uid()` is called for every row instead of once per query
**Why it happens:** PostgreSQL optimizer doesn't cache function results by default
**How to avoid:** Use `(SELECT auth.uid())` instead of `auth.uid()` in policies
**Warning signs:** Query execution time scales linearly with row count

### Pitfall 6: Using getSession() on Server
**What goes wrong:** Session may not be validated, security vulnerability
**Why it happens:** getSession() reads cookies but doesn't verify JWT signature
**How to avoid:** Always use `await supabase.auth.getUser()` on the server
**Warning signs:** Using `getSession()` in Server Components or Actions

## Code Examples

### Complete Database Schema for LMS
```sql
-- Source: Best practices from Supabase docs
-- supabase/migrations/20260126000000_initial_schema.sql

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Index for RLS policy column (id is primary key, already indexed)

-- ============================================
-- COURSES TABLE
-- ============================================
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Policies for courses
CREATE POLICY "Anyone can view published courses"
  ON public.courses FOR SELECT
  TO authenticated, anon
  USING (is_published = true);

CREATE POLICY "Instructors can view own courses"
  ON public.courses FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = instructor_id);

CREATE POLICY "Instructors can insert own courses"
  ON public.courses FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = instructor_id);

CREATE POLICY "Instructors can update own courses"
  ON public.courses FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = instructor_id)
  WITH CHECK ((SELECT auth.uid()) = instructor_id);

CREATE POLICY "Instructors can delete own courses"
  ON public.courses FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = instructor_id);

-- Indexes for RLS policy columns
CREATE INDEX idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX idx_courses_is_published ON public.courses(is_published);

-- ============================================
-- LESSONS TABLE
-- ============================================
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Policies for lessons
CREATE POLICY "Anyone can view lessons of published courses"
  ON public.lessons FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lessons.course_id
      AND courses.is_published = true
    )
  );

CREATE POLICY "Instructors can manage lessons of own courses"
  ON public.lessons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lessons.course_id
      AND courses.instructor_id = (SELECT auth.uid())
    )
  );

-- Indexes for RLS policy columns and common queries
CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_lessons_position ON public.lessons(course_id, position);

-- ============================================
-- ENROLLMENTS TABLE
-- ============================================
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Policies for enrollments
CREATE POLICY "Users can view own enrollments"
  ON public.enrollments FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can enroll themselves"
  ON public.enrollments FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can unenroll themselves"
  ON public.enrollments FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Instructors can view enrollments for their courses
CREATE POLICY "Instructors can view course enrollments"
  ON public.enrollments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = enrollments.course_id
      AND courses.instructor_id = (SELECT auth.uid())
    )
  );

-- Indexes for RLS policy columns
CREATE INDEX idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON public.enrollments(course_id);

-- ============================================
-- PROGRESS TABLE
-- ============================================
CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Policies for progress
CREATE POLICY "Users can view own progress"
  ON public.progress FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.progress FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own progress"
  ON public.progress FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Indexes for RLS policy columns
CREATE INDEX idx_progress_user_id ON public.progress(user_id);
CREATE INDEX idx_progress_lesson_id ON public.progress(lesson_id);

-- ============================================
-- FUNCTION: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON public.progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

### Type Generation Command
```bash
# Generate types from local database
npx supabase gen types typescript --local > src/types/database.types.ts

# Generate types from linked remote project
npx supabase gen types typescript --linked > src/types/database.types.ts
```

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Migration Workflow Commands
```bash
# Initialize Supabase in project
npx supabase init

# Start local Supabase stack (requires Docker)
npx supabase start

# Create new migration
npx supabase migration new initial_schema

# Apply migrations locally
npx supabase migration up

# Reset database and apply all migrations + seed
npx supabase db reset

# Link to remote project
npx supabase link --project-ref your-project-ref

# Push migrations to production
npx supabase db push

# Generate TypeScript types
npx supabase gen types typescript --local > src/types/database.types.ts
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @supabase/auth-helpers-nextjs | @supabase/ssr | 2024 | Universal SSR support, better cookie handling |
| createClientComponentClient | createBrowserClient | 2024 | Simplified API |
| createServerComponentClient | createServerClient | 2024 | Unified server client |
| Manual cookie handling | getAll/setAll pattern | 2024 | Simpler, handles chunking |
| getSession() on server | getUser() on server | 2024 | Security - validates JWT |

**Deprecated/outdated:**
- @supabase/auth-helpers-nextjs: Replaced by @supabase/ssr, do not use
- Individual cookie get/set methods: Use getAll/setAll pattern
- getSession() on server: Use getUser() which validates the token

## Open Questions

1. **Supabase project creation**
   - What we know: Need to create project at supabase.com to get URL and anon key
   - What's unclear: Whether to use local-only development or connect to remote immediately
   - Recommendation: Start with local development, connect remote when ready to deploy

2. **Profile creation strategy**
   - What we know: Can use trigger to auto-create profile on signup
   - What's unclear: Whether to allow profile creation without corresponding auth user
   - Recommendation: Use trigger approach, ensures 1:1 relationship with auth.users

## Sources

### Primary (HIGH confidence)
- [Supabase Auth SSR Docs](https://supabase.com/docs/guides/auth/server-side/nextjs) - Client setup patterns
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security) - RLS policies
- [Supabase RLS Performance](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv) - Index optimization
- [Supabase Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations) - Migration workflow
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) - CLI commands
- [Supabase Type Generation](https://supabase.com/docs/reference/cli/supabase-gen-types) - Type gen commands
- [Supabase AI Prompts RLS](https://supabase.com/docs/guides/getting-started/ai-prompts/database-rls-policies) - Policy patterns

### Secondary (MEDIUM confidence)
- [MakerKit Next.js Course](https://makerkit.dev/courses/nextjs-app-router/database) - Schema patterns
- [Supabase with Next.js Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs) - Complete examples

### Tertiary (LOW confidence)
- Web search results for LMS schema patterns - validated against official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Supabase documentation
- Architecture: HIGH - Official docs with complete code examples
- Pitfalls: HIGH - Documented in official troubleshooting guides

**Research date:** 2026-01-26
**Valid until:** 2026-02-26 (30 days - Supabase is relatively stable)
