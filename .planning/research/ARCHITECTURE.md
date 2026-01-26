# Architecture Patterns: Next.js 14 + Supabase Course Platform

**Domain:** Online course platform with premium video content
**Researched:** 2026-01-26
**Overall Confidence:** HIGH (verified with official Supabase docs and community patterns)

## Executive Summary

This architecture integrates Supabase backend services into an existing Next.js 14 App Router landing page with internationalization (`[locale]` dynamic segment). The architecture prioritizes server-side rendering for SEO, uses cookie-based auth for SSR compatibility, and leverages Supabase's Row Level Security (RLS) for data protection at the database level.

---

## Recommended Architecture Overview

```
                                    +------------------+
                                    |   Supabase       |
                                    |   Platform       |
                                    +--------+---------+
                                             |
              +------------------------------+------------------------------+
              |                              |                              |
    +---------v---------+        +-----------v-----------+       +----------v----------+
    |   PostgreSQL      |        |      Auth Service     |       |      Storage        |
    |   + RLS Policies  |        |   (Cookie-based SSR)  |       |   (Video Buckets)   |
    +-------------------+        +-----------------------+       +---------------------+
              ^                              ^                              ^
              |                              |                              |
              +------------------------------+------------------------------+
                                             |
                                    +--------v---------+
                                    |    Middleware    |
                                    |  (updateSession) |
                                    +--------+---------+
                                             |
              +------------------------------+------------------------------+
              |                              |                              |
    +---------v---------+        +-----------v-----------+       +----------v----------+
    | Server Components |        |   Client Components   |       |    API Routes       |
    | (createServer     |        |   (createBrowser      |       |   (Admin ops,       |
    |  Client)          |        |    Client)            |       |    service role)    |
    +-------------------+        +-----------------------+       +---------------------+
              |                              |                              |
              +------------------------------+------------------------------+
                                             |
                                    +--------v---------+
                                    |   Existing App   |
                                    |   [locale]/...   |
                                    +------------------+
```

---

## Component Boundaries

| Component | Responsibility | Communicates With | Location |
|-----------|---------------|-------------------|----------|
| **Middleware** | Session refresh, route protection, auth redirects | Supabase Auth, all routes | `/middleware.ts` |
| **Server Client** | Server-side Supabase operations (SSR data fetch) | PostgreSQL, Auth | `/lib/supabase/server.ts` |
| **Browser Client** | Client-side Supabase operations (real-time, mutations) | PostgreSQL, Auth | `/lib/supabase/client.ts` |
| **Auth Context** | Client-side auth state management | Browser Client, UI | `/components/providers/auth-provider.tsx` |
| **API Routes** | Admin operations, service role actions, webhooks | Supabase (service role) | `/app/api/**` |
| **Course Components** | Display courses, lessons, progress | Server/Browser Client | `/components/course/**` |
| **Admin Components** | CMS for courses/lessons management | API Routes | `/app/[locale]/admin/**` |

---

## Data Flow

### 1. Authentication Flow

```
User Login Request
       |
       v
+------+-------+
|  Middleware  | <-- Always runs first
+------+-------+
       |
       v (no session)
+------+-------+
| /auth/login  | <-- Login page
+------+-------+
       |
       v (credentials)
+------+-------+
| Supabase Auth| <-- Email/password or OAuth
+------+-------+
       |
       v (session cookie set)
+------+-------+
|  Middleware  | <-- updateSession() refreshes token
+------+-------+
       |
       v (redirect)
+------+-------+
| /dashboard   | <-- Protected area
+------+-------+
```

### 2. Course Content Access Flow

```
User visits /courses/[courseId]/lessons/[lessonId]
       |
       v
+------+-------+
|  Middleware  | <-- Verifies auth, refreshes session
+------+-------+
       |
       v
+------+-------+
| Server Comp  | <-- createServerClient()
+------+-------+
       |
       v
+------+-------+
| Check Access | <-- RLS policy: user enrolled?
+------+-------+
       |
       +------ NO -----> Redirect to enrollment/pricing
       |
       v YES
+------+-------+
| Fetch Lesson | <-- Content from DB
+------+-------+
       |
       v
+------+-------+
| Signed URL   | <-- Video URL (time-limited)
+------+-------+
       |
       v
+------+-------+
| Render Page  | <-- Video player + content
+------+-------+
```

### 3. Progress Tracking Flow

```
User watches video / completes lesson
       |
       v
+------+-------+
| Client Comp  | <-- React state tracks progress
+------+-------+
       |
       v (debounced update)
+------+-------+
| Browser      | <-- createBrowserClient()
| Client       |
+------+-------+
       |
       v
+------+-------+
| RLS Policy   | <-- User can only update own progress
+------+-------+
       |
       v
+------+-------+
| progress     | <-- Upsert record
| table        |
+------+-------+
```

---

## Database Schema Design

### Core Tables

```sql
-- Users (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin', 'instructor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  price_cents INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules (course sections)
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  video_path TEXT, -- Path in Supabase Storage
  duration_seconds INTEGER,
  position INTEGER NOT NULL,
  is_preview BOOLEAN DEFAULT FALSE, -- Free preview lessons
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module_id, slug)
);

-- Enrollments
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL = lifetime access
  UNIQUE(user_id, course_id)
);

-- Progress tracking
CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  progress_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);
```

### Row Level Security Policies

```sql
-- Profiles: Users can read all, update own
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Courses: Published courses visible to all
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published courses are viewable by everyone"
  ON public.courses FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Lessons: Viewable if enrolled or preview
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Preview lessons are viewable by everyone"
  ON public.lessons FOR SELECT
  USING (is_preview = true);

CREATE POLICY "Enrolled users can view lessons"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.modules m ON m.course_id = e.course_id
      WHERE m.id = lessons.module_id
      AND e.user_id = auth.uid()
      AND (e.expires_at IS NULL OR e.expires_at > NOW())
    )
  );

-- Progress: Users can only access own progress
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON public.progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.progress FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## Patterns to Follow

### Pattern 1: Supabase Client Utilities

**What:** Centralized client creation functions
**When:** Always - never create Supabase clients inline
**Confidence:** HIGH (official Supabase docs)

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
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
            // Called from Server Component - ignore
          }
        },
      },
    }
  )
}
```

### Pattern 2: Middleware for Session Management

**What:** Refresh auth tokens on every request
**When:** Required for all Supabase SSR apps
**Confidence:** HIGH (official pattern)

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Use getUser(), not getSession()
  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  const protectedPaths = ['/dashboard', '/courses', '/admin']
  const isProtected = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Pattern 3: Server Component Data Fetching

**What:** Fetch data directly in Server Components
**When:** Initial page load, SEO-critical content
**Confidence:** HIGH

```typescript
// app/[locale]/courses/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function CoursePage({
  params
}: {
  params: { slug: string; locale: string }
}) {
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select(`
      *,
      modules (
        *,
        lessons (*)
      )
    `)
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!course) notFound()

  return <CourseContent course={course} />
}
```

### Pattern 4: Signed URLs for Video Content

**What:** Time-limited URLs for private video files
**When:** Serving premium video content
**Confidence:** HIGH (official storage docs)

```typescript
// lib/supabase/storage.ts
import { createClient } from '@/lib/supabase/server'

export async function getVideoUrl(videoPath: string): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from('course-videos')
    .createSignedUrl(videoPath, 3600) // 1 hour expiry

  if (error) {
    console.error('Error creating signed URL:', error)
    return null
  }

  return data.signedUrl
}
```

### Pattern 5: Service Role for Admin Operations

**What:** Bypass RLS for admin/CMS operations
**When:** API routes that need full database access
**Confidence:** HIGH

```typescript
// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// ONLY use in API routes, NEVER expose to client
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Server-only env var
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
```

```typescript
// app/api/admin/courses/route.ts
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Verify admin role first
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Now use admin client for operations
  const adminClient = createAdminClient()
  const body = await request.json()

  const { data, error } = await adminClient
    .from('courses')
    .insert(body)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Using getSession() on Server

**What:** Using `supabase.auth.getSession()` in server code
**Why bad:** Not guaranteed to revalidate the auth token; can be spoofed
**Instead:** Always use `supabase.auth.getUser()` which validates against Supabase Auth server

```typescript
// BAD - Don't do this
const { data: { session } } = await supabase.auth.getSession()
if (session?.user) { /* ... */ }

// GOOD - Do this instead
const { data: { user } } = await supabase.auth.getUser()
if (user) { /* ... */ }
```

### Anti-Pattern 2: Exposing Service Role Key

**What:** Using `SUPABASE_SERVICE_ROLE_KEY` in client components or NEXT_PUBLIC env vars
**Why bad:** Bypasses all RLS, full database access to anyone
**Instead:** Only use in API routes, never prefix with NEXT_PUBLIC_

### Anti-Pattern 3: Inline Client Creation

**What:** Creating Supabase client directly in components
**Why bad:** Inconsistent configuration, harder to maintain, type safety issues
**Instead:** Use centralized client utilities in `/lib/supabase/`

### Anti-Pattern 4: Not Enabling RLS

**What:** Creating tables without Row Level Security
**Why bad:** All data exposed via API with anon key
**Instead:** Always enable RLS and create appropriate policies BEFORE inserting data

### Anti-Pattern 5: Client-Side Video URL Generation

**What:** Creating signed URLs in client components
**Why bad:** Exposes storage patterns, potential for abuse
**Instead:** Generate signed URLs server-side (Server Components or API routes)

---

## File Structure Recommendation

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx                 # Existing - add AuthProvider
│   │   ├── page.tsx                   # Existing landing page
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── callback/route.ts      # OAuth callback
│   │   │   └── confirm/route.ts       # Email confirmation
│   │   ├── dashboard/
│   │   │   └── page.tsx               # User dashboard
│   │   ├── courses/
│   │   │   ├── page.tsx               # Course listing
│   │   │   └── [slug]/
│   │   │       ├── page.tsx           # Course detail
│   │   │       └── lessons/
│   │   │           └── [lessonSlug]/
│   │   │               └── page.tsx   # Lesson player
│   │   └── admin/                     # Admin CMS
│   │       ├── layout.tsx             # Admin layout with nav
│   │       ├── page.tsx               # Admin dashboard
│   │       ├── courses/
│   │       │   ├── page.tsx           # Course management
│   │       │   ├── new/page.tsx
│   │       │   └── [id]/edit/page.tsx
│   │       └── lessons/
│   │           └── [...]/
│   └── api/
│       ├── admin/                     # Admin API (service role)
│       │   ├── courses/route.ts
│       │   ├── lessons/route.ts
│       │   └── upload/route.ts        # Video upload handler
│       └── webhooks/
│           └── stripe/route.ts        # Payment webhooks
├── components/
│   ├── layout/                        # Existing
│   ├── sections/                      # Existing landing sections
│   ├── ui/                            # Existing
│   ├── providers/
│   │   └── auth-provider.tsx          # Auth context
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── user-menu.tsx
│   └── course/
│       ├── course-card.tsx
│       ├── lesson-list.tsx
│       ├── video-player.tsx
│       └── progress-tracker.tsx
├── lib/
│   ├── utils.ts                       # Existing
│   └── supabase/
│       ├── client.ts                  # Browser client
│       ├── server.ts                  # Server client
│       ├── admin.ts                   # Service role client
│       ├── storage.ts                 # Storage utilities
│       └── middleware.ts              # Middleware helpers
├── types/
│   └── database.ts                    # Generated from Supabase
├── middleware.ts                      # Root middleware
└── i18n.ts                            # Existing
```

---

## Integration with Existing Architecture

### Preserving [locale] Routing

The existing `[locale]` dynamic segment must be preserved. Supabase routes integrate within it:

```
/[locale]/                    # Landing page (existing)
/[locale]/auth/login          # NEW
/[locale]/courses             # NEW
/[locale]/courses/[slug]      # NEW
/[locale]/admin               # NEW
```

### Middleware Compatibility

The new Supabase middleware must work alongside next-intl. Recommended approach:

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { locales, defaultLocale } from '@/i18n'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
})

export async function middleware(request: NextRequest) {
  // First, handle Supabase session
  const response = NextResponse.next({ request })

  const supabase = createServerClient(/* ... cookie config ... */)
  await supabase.auth.getUser() // Refresh session

  // Then, apply i18n middleware
  return intlMiddleware(request)
}
```

### Provider Hierarchy

Update the layout to include auth context:

```typescript
// app/[locale]/layout.tsx
<html lang={locale}>
  <body>
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <AuthProvider>        {/* NEW */}
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  </body>
</html>
```

---

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **Database** | Supabase Free/Pro tier | Supabase Pro, connection pooling | Supabase Enterprise, read replicas |
| **Video Storage** | Supabase Storage | Supabase Storage + CDN | Cloudflare R2/Stream, dedicated CDN |
| **Auth Sessions** | Default cookie settings | Consider shorter session duration | Redis session store |
| **RLS Performance** | No optimization needed | Index foreign keys used in policies | Optimize policies, consider materialized views |
| **API Rate Limits** | Default limits OK | Implement client-side throttling | API gateway, rate limiting |

---

## Build Order (Dependencies)

Phase order based on component dependencies:

```
Phase 1: Foundation (no dependencies)
├── Install @supabase/supabase-js, @supabase/ssr
├── Create lib/supabase/ utilities
├── Set up middleware.ts
├── Generate database types
└── Environment variables

Phase 2: Auth (depends on Phase 1)
├── Create auth pages (login, register)
├── OAuth callback route
├── AuthProvider component
├── User menu component
└── Protected route logic in middleware

Phase 3: Database Schema (depends on Phase 2)
├── Create tables (profiles, courses, modules, lessons)
├── Set up RLS policies
├── Create enrollments and progress tables
└── Database triggers (updated_at, profile creation)

Phase 4: Course Display (depends on Phase 3)
├── Course listing page
├── Course detail page
├── Module/lesson navigation
└── Progress tracking components

Phase 5: Video Delivery (depends on Phase 4)
├── Set up Storage bucket
├── Signed URL generation
├── Video player component
├── Progress sync (watch position)

Phase 6: Admin CMS (depends on Phase 3)
├── Admin layout with navigation
├── Course CRUD operations
├── Lesson management
├── Video upload with progress

Phase 7: Enrollment/Payments (depends on Phase 4)
├── Enrollment flow
├── Stripe integration (if needed)
├── Access control in middleware
└── Payment webhooks
```

---

## Sources

**HIGH Confidence (Official Documentation):**
- [Setting up Server-Side Auth for Next.js | Supabase Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Creating a Supabase client for SSR | Supabase Docs](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Row Level Security | Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Storage Buckets | Supabase Docs](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Supabase Architecture | Supabase Docs](https://supabase.com/docs/guides/getting-started/architecture)

**MEDIUM Confidence (Verified Community Patterns):**
- [Supabase + Next.js Guide | Medium](https://medium.com/@iamqitmeeer/supabase-next-js-guide-the-real-way-01a7f2bd140c)
- [E-Learning Portal Data Model | Redgate](https://www.red-gate.com/blog/a-smart-way-to-build-skills-an-e-learning-portal-data-model)
- [Supabase Row Level Security Guide 2025](https://vibeappscanner.com/supabase-row-level-security)

**LOW Confidence (Requires Validation):**
- Video streaming with HLS.js (mentioned in GitHub discussions, not officially documented for this use case)
- Cloudflare R2 as alternative storage (community recommendation)
