# Technology Stack

**Project:** Mestres Clone - Online Course Platform
**Researched:** 2026-01-26
**Focus:** Stack additions for Supabase backend, OAuth, self-hosted video, admin CMS

---

## Executive Summary

This document recommends the technology stack for adding backend functionality to the existing Next.js 14 landing page. The stack prioritizes:

1. **Supabase-only constraint** - All backend services via Supabase (auth, database, storage)
2. **Self-hosted video** - MP4/HLS via Supabase Storage with Vidstack player
3. **Type-safe forms** - React Hook Form + Zod for validation
4. **Custom admin** - Build with shadcn/ui rather than heavy admin libraries

---

## Existing Stack (Keep)

| Technology | Version | Status |
|------------|---------|--------|
| Next.js | 14.2.21 | Keep |
| React | ^18 | Keep |
| TypeScript | ^5 | Keep |
| Tailwind CSS | ^3.4.1 | Keep |
| Framer Motion | ^11.15.0 | Keep |
| next-intl | ^3.22.0 | Keep |
| next-themes | ^0.4.4 | Keep |
| clsx + tailwind-merge | ^2.x | Keep |
| lucide-react | ^0.469.0 | Keep |

---

## Recommended Stack Additions

### Backend & Database (Supabase)

| Package | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| `@supabase/supabase-js` | ^2.80.0 | Core Supabase client for database, auth, storage | HIGH |
| `@supabase/ssr` | ^0.8.0 | Server-side rendering support for Next.js App Router | HIGH |

**Why these versions:**
- `@supabase/supabase-js` 2.80.0 is current stable (verified via npm)
- `@supabase/ssr` replaces deprecated `@supabase/auth-helpers-nextjs`
- SSR package handles cookie-based auth properly for App Router

**Key Setup Requirements:**
1. Create `lib/supabase/client.ts` - Browser client with `createBrowserClient`
2. Create `lib/supabase/server.ts` - Server client with `createServerClient`
3. Create `middleware.ts` - Session refresh middleware (required for RSC)
4. Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Sources:**
- [Supabase SSR Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Migration Guide](https://supabase.com/docs/guides/auth/server-side/migrating-to-ssr-from-auth-helpers)

---

### Authentication (Supabase Auth)

| Feature | Implementation | Confidence |
|---------|----------------|------------|
| Google OAuth | Supabase Auth with Google provider | HIGH |
| GitHub OAuth | Supabase Auth with GitHub provider | HIGH |
| Email/Password | Supabase Auth (optional fallback) | HIGH |
| Session Management | Cookie-based via `@supabase/ssr` | HIGH |

**Why Supabase Auth:**
- Unified with database (RLS policies use auth.uid())
- Built-in OAuth providers (no separate NextAuth needed)
- Cookie-based sessions work with SSR/RSC
- JWT tokens with configurable expiry

**Architecture Decision:**
- Use Supabase Auth exclusively (not NextAuth.js)
- Reason: Tighter integration with RLS, simpler stack, constraint compliance

**What NOT to use:**
- `next-auth` / `auth.js` - Would add complexity; Supabase Auth covers all needs
- `@supabase/auth-helpers-nextjs` - Deprecated, use `@supabase/ssr` instead

---

### Video Player

| Package | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| `@vidstack/react` | ^1.12.x (or latest) | Modern video player with HLS support | HIGH |

**Why Vidstack:**
- Modern alternative to Video.js and JW Player (MIT license)
- Built for React with hooks and components
- HLS streaming support via hls.js integration
- Headless architecture - full control over UI styling
- SSR/RSC compatible with Next.js App Router
- Tailwind CSS integration available

**Installation:**
```bash
npm install @vidstack/react
```

**React 18 Compatibility Note:**
- Vidstack works with React 18 (project uses ^18)
- For React 19 projects, use `--legacy-peer-deps` flag

**HLS Streaming Setup:**
- Upload HLS segments (.m3u8 + .ts files) to Supabase Storage
- Vidstack auto-loads hls.js for browser compatibility
- Falls back to native HLS on Safari

**What NOT to use:**
- `video.js` - Heavier, less React-native, more complex theming
- `react-player` - Less customizable, Mux is taking over maintenance
- `plyr` - Good but Vidstack is more modern and actively maintained

**Sources:**
- [Vidstack Docs](https://vidstack.io/docs/player/)
- [Vidstack HLS Provider](https://vidstack.io/docs/player/api/providers/hls/)

---

### Form Handling & Validation

| Package | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| `react-hook-form` | ^7.54.x | Form state management | HIGH |
| `zod` | ^3.24.x | Schema validation (shared client/server) | HIGH |
| `@hookform/resolvers` | ^5.x | Zod integration for RHF | HIGH |

**Why this combination:**
- React Hook Form: Best performance (uncontrolled inputs, minimal re-renders)
- Zod: TypeScript-first, works on client AND server actions
- Zero runtime dependencies for RHF
- Type inference from Zod schemas (v5 resolvers feature)

**Key Pattern - Shared Validation:**
```typescript
// lib/validations/contact.ts
import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
  message: z.string().min(10, 'Message too short'),
});

export type ContactFormData = z.infer<typeof contactSchema>;
```

Use the same schema for:
1. Client-side form validation (RHF + zodResolver)
2. Server Action validation (schema.parse())

**What NOT to use:**
- `formik` - More re-renders, larger bundle, controlled inputs
- `yup` - Less TypeScript ergonomic than Zod
- React 19 form actions alone - Good for simple forms, but RHF better for complex UX

**Sources:**
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod with Server Actions](https://nehalist.io/react-hook-form-with-nextjs-server-actions/)

---

### Admin CMS / Dashboard

| Approach | Recommendation | Confidence |
|----------|----------------|------------|
| Strategy | Custom build with shadcn/ui | MEDIUM |

**Recommendation: Build Custom Admin**

For a course platform, build a custom admin dashboard rather than using react-admin or Refine because:

1. **Tighter Supabase Integration** - Custom queries, RLS-aware
2. **Consistent Design** - Match your existing Tailwind + Framer Motion
3. **Specific Features** - Course/lesson management, video upload, progress tracking
4. **Simpler Stack** - No additional framework abstraction

**Required shadcn/ui Components:**
```bash
npx shadcn@latest add table data-table dialog form input textarea select button card tabs badge
```

| Component | Purpose |
|-----------|---------|
| `data-table` | Course/user lists with sorting, filtering |
| `dialog` | Create/edit modals |
| `form` | Integrated with RHF |
| `tabs` | Section navigation |
| `badge` | Status indicators |

**What NOT to use:**
- `react-admin` - Overkill, brings MUI, complex data provider setup
- `refine` - Good for CRUD, but adds significant abstraction layer
- `sanity` / `contentful` - External CMS; you want Supabase-only

**Alternative (if rapid development needed):**
- Consider [NextAdmin template](https://nextadmin.co/) as starting point
- But still customize heavily for course-specific features

---

### File/Video Storage

| Service | Purpose | Confidence |
|---------|---------|------------|
| Supabase Storage | Video files, thumbnails, attachments | HIGH |

**Supabase Storage for Video:**
- Upload MP4 directly for simple playback
- Upload HLS (.m3u8 + segments) for adaptive streaming
- CDN included (285+ global locations)
- Smart CDN caching with auto-invalidation

**Limitations to understand:**
- Free tier: 50MB max file size, 2GB bandwidth/month
- Pro tier: 500GB max file size
- No automatic transcoding (must pre-encode to HLS externally if needed)

**Video Workflow:**
1. Admin uploads video (MP4 or pre-encoded HLS)
2. Store in private bucket with RLS
3. Generate signed URLs for authenticated playback
4. Vidstack player consumes signed URL

**For HLS encoding (if needed):**
- Use FFmpeg locally or via serverless function
- Or use external service (Mux, Cloudflare Stream) for encoding only
- Store output in Supabase Storage

**What NOT to use:**
- Cloudflare R2 - Good but breaks Supabase-only constraint
- AWS S3 - Same issue, adds complexity
- YouTube embeds - Not self-hosted, loses control

---

### Database Schema (Supabase PostgreSQL)

**Recommended Tables:**

```sql
-- Users extension (linked to auth.users)
create table public.profiles (
  id uuid references auth.users primary key,
  full_name text,
  avatar_url text,
  role text default 'student', -- 'student' | 'admin'
  created_at timestamptz default now()
);

-- Courses
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  thumbnail_url text,
  price decimal(10,2),
  is_published boolean default false,
  created_at timestamptz default now()
);

-- Lessons
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses on delete cascade,
  title text not null,
  description text,
  video_url text, -- Supabase Storage path
  order_index integer not null,
  duration_seconds integer,
  is_preview boolean default false,
  created_at timestamptz default now()
);

-- User Progress
create table public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  lesson_id uuid references public.lessons on delete cascade,
  completed_at timestamptz,
  last_position_seconds integer default 0,
  unique(user_id, lesson_id)
);

-- Enrollments
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  course_id uuid references public.courses on delete cascade,
  enrolled_at timestamptz default now(),
  unique(user_id, course_id)
);
```

**Row Level Security (Critical):**
```sql
-- Users can only read their own profile
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

-- Users can only see courses they're enrolled in
alter table public.lessons enable row level security;
create policy "Enrolled users can view lessons" on public.lessons
  for select using (
    exists (
      select 1 from public.enrollments e
      join public.courses c on e.course_id = c.id
      where e.user_id = auth.uid()
      and c.id = lessons.course_id
    )
    or
    lessons.is_preview = true
  );
```

---

### Additional Utilities

| Package | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| `date-fns` | ^4.x | Date formatting (lightweight) | HIGH |
| `sonner` | ^1.7.x | Toast notifications | HIGH |
| `@tanstack/react-query` | ^5.x | Server state management (optional) | MEDIUM |

**Notes:**
- `sonner` - Better than react-hot-toast, works with Next.js App Router
- `@tanstack/react-query` - Optional; useful if you have complex caching needs beyond Supabase realtime
- `date-fns` - Modular, tree-shakeable date library

---

## Installation Summary

```bash
# Core Supabase
npm install @supabase/supabase-js @supabase/ssr

# Video Player
npm install @vidstack/react

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# UI Components (via shadcn CLI)
npx shadcn@latest add table data-table dialog form input textarea select button card tabs badge toast

# Utilities
npm install date-fns sonner
```

**Environment Variables (.env.local):**
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not Alternative |
|----------|-------------|-------------|---------------------|
| Auth | Supabase Auth | NextAuth.js | Adds complexity, Supabase Auth sufficient |
| Video | Vidstack | Video.js | Heavier, less React-native |
| Video | Vidstack | react-player | Less customizable, uncertain maintenance |
| Forms | RHF + Zod | Formik | More re-renders, larger bundle |
| Forms | RHF + Zod | React 19 actions only | Less UX control for complex forms |
| Admin | Custom + shadcn | react-admin | Overkill, brings MUI, complex setup |
| Admin | Custom + shadcn | Refine | Extra abstraction, more to learn |
| Storage | Supabase Storage | Cloudflare R2 | Breaks Supabase-only constraint |
| Database | Supabase PostgreSQL | PlanetScale | Breaks Supabase-only constraint |

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| Supabase packages | HIGH | Official docs, npm verified, stable releases |
| Vidstack | HIGH | Well-documented, active development, MIT license |
| RHF + Zod | HIGH | Industry standard, verified with official docs |
| Admin approach | MEDIUM | Custom build is judgment call; templates exist |
| Video storage limits | HIGH | Verified via Supabase docs |
| Database schema | MEDIUM | Standard pattern but may need adjustment |

---

## Sources

### Official Documentation
- [Supabase Next.js Server-Side Auth](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Storage CDN](https://supabase.com/docs/guides/storage/cdn/fundamentals)
- [Vidstack Player Docs](https://vidstack.io/docs/player/)
- [React Hook Form](https://react-hook-form.com/)

### npm Packages
- [@supabase/supabase-js](https://www.npmjs.com/package/@supabase/supabase-js)
- [@supabase/ssr](https://www.npmjs.com/package/@supabase/ssr)
- [@vidstack/react](https://www.npmjs.com/package/@vidstack/react)
- [@hookform/resolvers](https://www.npmjs.com/package/@hookform/resolvers)

### Community Resources
- [Supabase + Next.js Cookie Auth Guide](https://the-shubham.medium.com/next-js-supabase-cookie-based-auth-workflow-the-best-auth-solution-2025-guide-f6738b4673c1)
- [RHF + Zod + Server Actions](https://nehalist.io/react-hook-form-with-nextjs-server-actions/)
- [Vidstack HLS Streaming](https://vidstack.io/docs/player/api/providers/hls/)
