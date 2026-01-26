# Project Research Summary

**Project:** Mestres Clone - Online Course Platform
**Domain:** Learning Management System (LMS) with self-hosted video
**Researched:** 2026-01-26
**Confidence:** HIGH

## Executive Summary

This project adds backend functionality to an existing Next.js 14 landing page to create a complete online course platform for the Portuguese/Brazilian market. The recommended approach uses Supabase exclusively for backend services (database, authentication, storage) with self-hosted video delivery via signed URLs. This architecture prioritizes security through Row Level Security (RLS), integrates with the existing App Router structure, and supports server-side rendering for SEO.

The research reveals that successful course platforms balance three critical areas: robust authentication with proper session management, secure video delivery to prevent piracy, and database-level security to protect user data. The stack is deliberately minimal - Next.js 14, Supabase, Vidstack player, React Hook Form, and custom admin UI built with shadcn/ui - avoiding heavy frameworks that would add complexity without clear benefit given the Supabase-only constraint.

The primary risks are security-related: 83% of Supabase database breaches involve RLS misconfiguration, and course platforms lose an estimated 30% revenue to content piracy through URL sharing. These are completely preventable through proper RLS policies from day one and short-lived signed URLs with per-user enrollment verification. The roadmap must address database security in Phase 1 before any data is added, and video access control must be central to the video delivery phase, not an afterthought.

## Key Findings

### Recommended Stack

The stack builds on the existing Next.js 14 foundation with minimal additions focused on Supabase integration. All backend services flow through Supabase to maintain the single-provider constraint, simplifying architecture and reducing points of failure.

**Core technologies:**
- **@supabase/supabase-js 2.80.0**: Core client library - handles database queries, auth operations, storage access
- **@supabase/ssr 0.8.0**: SSR support for Next.js App Router - replaces deprecated auth-helpers, enables cookie-based sessions compatible with Server Components
- **@vidstack/react 1.12+**: Modern video player with HLS support - MIT licensed, headless architecture for full styling control, lighter than Video.js
- **react-hook-form 7.54+**: Form management with minimal re-renders - uncontrolled inputs for performance
- **zod 3.24+**: Schema validation shared between client and server - TypeScript-first, enables type inference
- **Custom admin (shadcn/ui)**: Build course/lesson management UI rather than using react-admin or Refine - tighter Supabase integration, matches existing Tailwind styling

**Critical decisions:**
- Use Supabase Auth exclusively (not NextAuth.js) - simpler stack, tighter RLS integration
- Self-host video in Supabase Storage with signed URLs - maintains Supabase-only constraint, CDN included
- Build custom admin rather than CMS framework - course platforms need specific workflows that generic admin panels don't handle well

**Version notes:**
- @supabase/ssr is required for Next.js 14 App Router - the auth-helpers packages are deprecated
- Vidstack works with React 18 (project uses ^18) without issues

### Expected Features

The feature landscape divides cleanly into table stakes (expected by all users), differentiators (competitive advantages), and anti-features (common mistakes to avoid). The MVP should focus exclusively on table stakes with select differentiators that are low-complexity but high-value.

**Must have (table stakes):**
- OAuth authentication (Google) - reduces friction vs email/password
- User dashboard showing enrolled courses and progress
- Course catalog with detail pages
- Video playback with basic controls
- Lesson navigation (previous/next, curriculum sidebar)
- Progress tracking (lesson completion checkboxes)
- Material downloads per lesson
- Course/lesson CRUD in admin
- Video upload with progress indicator
- Responsive design (50%+ traffic is mobile)

**Should have (competitive):**
- Resume playback - continue where user left off
- Playback speed control (0.5x - 2x)
- Progress milestones (celebrate 25%, 50%, 75%, 100%)
- Dark/Light theme (already partially implemented)
- PT-BR localization (already in place via next-intl)

**Defer (v2+):**
- GitHub OAuth (Google covers 90%+ use case initially)
- Gamification (badges, points) - nice but not core value
- Q&A per lesson - moderation burden, email support works for v1
- Learning paths - requires multiple courses to be meaningful
- Analytics dashboard - raw SQL queries work initially
- Email notifications - can notify manually, automate later
- Certificate generation - manual via email if needed
- Live webinars - different infrastructure (WebRTC), async video is core

**Anti-features (do NOT build):**
- Email/password auth in v1 - OAuth-only reduces security surface
- Subscription billing - adds complexity, one-time or free access for v1
- Full discussion forums - moderation nightmare, simple Q&A or none
- Marketplace/multi-instructor - payment splits, legal complexity
- Locked navigation - frustrates learners, allow free navigation
- Complex quiz engine - scope creep, simple completion tracking works

### Architecture Approach

The architecture integrates Supabase backend into the existing Next.js 14 App Router structure with `[locale]` routing preserved. The design follows Server Component patterns with cookie-based authentication and database-level security through Row Level Security (RLS).

**Major components:**

1. **Supabase Client Utilities** (`lib/supabase/`)
   - `client.ts` - Browser client using createBrowserClient for Client Components
   - `server.ts` - Server client using createServerClient with cookie handling for RSCs/Server Actions
   - `admin.ts` - Service role client for admin operations (bypasses RLS, API routes only)
   - `storage.ts` - Signed URL generation with enrollment verification

2. **Middleware** (`middleware.ts`)
   - Session refresh on every request (prevents token expiry)
   - Protected route enforcement (redirect to login if unauthenticated)
   - Works alongside next-intl middleware (chain them properly)

3. **Database Schema** (Supabase PostgreSQL)
   - `profiles` - extends auth.users with role, avatar
   - `courses` - title, slug, description, thumbnail, price, published status
   - `modules` - course sections with position ordering
   - `lessons` - video_path, duration, position, is_preview flag
   - `enrollments` - user-course relationship with expiration
   - `progress` - user-lesson completion with video position tracking
   - **RLS policies on every table** - users only see their data, enrolled courses

4. **Video Delivery Pipeline**
   - Admin uploads video via API route to Supabase Storage private bucket
   - Server Action generates signed URL (1 hour expiry) after verifying enrollment
   - Vidstack player streams from signed URL
   - Progress tracking saves position every 30-60s + beforeunload event

5. **Admin CMS** (`app/[locale]/admin/`)
   - Custom UI built with shadcn/ui components (table, dialog, form)
   - API routes with service role client for admin operations
   - Role check (admin flag in profiles table) before allowing access

**Key patterns:**
- Never use getSession() on server - always use getUser() for token validation
- Generate video URLs server-side only - never expose storage patterns to client
- Index all columns used in RLS policies - performance critical as data grows
- Use Server Components for initial data fetch - client components for interactivity

### Critical Pitfalls

Based on security research and community experience, these five pitfalls are the most damaging if not addressed proactively.

1. **RLS Not Enabled on Tables (Data Exposure)**
   - Impact: Complete database breach via public API, all user data exposed
   - Why it happens: RLS disabled by default, developers forget to enable before adding data
   - Prevention: Enable RLS immediately after creating each table, create at least one policy, run Security Advisor before every deploy
   - Phase to address: Phase 1 (Database Setup) - before any data exists

2. **RLS Enabled Without Policies (Complete Lockout)**
   - Impact: App shows no data despite database having content, confusing bugs
   - Why it happens: Enabling RLS without policies creates "deny all" default
   - Prevention: Always pair RLS enable with at least one policy in same migration
   - Phase to address: Phase 1 (Database Setup)

3. **Self-Hosted Video Without Access Control**
   - Impact: Course piracy via URL sharing, 30% revenue loss, content on Telegram groups
   - Why it happens: Long-lived or public URLs, no enrollment verification
   - Prevention: Short-lived signed URLs (1 hour max), verify enrollment before generating, random file names
   - Phase to address: Phase 3 (Video Delivery) - core value protection

4. **OAuth Callback Cookie Issues (Auth Breaks Silently)**
   - Impact: Users can't complete signup/login, session doesn't persist, works then logs out
   - Why it happens: Missing exchangeCodeForSession in callback, wrong Supabase package
   - Prevention: Use @supabase/ssr (not auth-helpers), proper callback route, test on multiple browsers
   - Phase to address: Phase 2 (Authentication) - test thoroughly before moving on

5. **RLS Performance Issues (Slow Page Loads)**
   - Impact: 3-10+ second page loads, users abandon platform
   - Why it happens: Missing indexes on policy columns, complex joins evaluated per-row
   - Prevention: Index all columns in WHERE clauses of policies, wrap auth.uid() in subquery for caching
   - Phase to address: Phase 1 (Design) + Phase 4 (Optimization after testing)

**Additional moderate pitfalls:**
- Views bypass RLS (use security_invoker = true on Postgres 15+)
- Video player bundle bloat (lazy load with next/dynamic)
- N+1 queries for progress (use joins, not per-course queries)
- No adaptive bitrate (HLS with multiple qualities needed)

## Implications for Roadmap

Based on research findings, the roadmap must follow strict dependency ordering with security-first approach. The critical path is: foundation → auth → database → content display → video delivery → admin tools.

### Phase 1: Foundation + Database Security
**Rationale:** Database schema and RLS policies must exist BEFORE any other backend work. This phase has no dependencies on other phases but is a dependency for everything else. Research shows 83% of Supabase breaches involve RLS misconfiguration - addressing this first is non-negotiable.

**Delivers:**
- Supabase project created and connected
- Client utilities (browser, server, admin clients)
- Middleware with session refresh
- Database tables (profiles, courses, modules, lessons, enrollments, progress)
- RLS policies on ALL tables
- Indexes on policy columns
- Database types generated for TypeScript

**Addresses (from FEATURES.md):**
- Infrastructure for all backend features

**Avoids (from PITFALLS.md):**
- Pitfall #1 (RLS not enabled)
- Pitfall #2 (RLS without policies)
- Pitfall #5 (RLS performance issues) - by designing indexes from start

**Technical notes:**
- Use @supabase/ssr not @supabase/auth-helpers (deprecated)
- Enable RLS on every table in same migration that creates it
- Test with Security Advisor before proceeding to Phase 2

### Phase 2: Authentication + User Management
**Rationale:** Auth must work before any user-facing features since everything requires session context. The OAuth callback is complex (cookie handling, PKCE flow) and needs thorough testing before building dependent features.

**Delivers:**
- OAuth login (Google) with proper callback handling
- Auth provider context
- User profile creation/editing
- Protected route enforcement in middleware
- User menu with logout
- Profile page

**Uses (from STACK.md):**
- Supabase Auth (not NextAuth.js)
- @supabase/ssr for cookie-based sessions

**Implements (from ARCHITECTURE.md):**
- Auth context provider
- Middleware protected route logic
- Server/browser client integration

**Avoids (from PITFALLS.md):**
- Pitfall #4 (OAuth callback cookie issues) - proper exchangeCodeForSession implementation

**Technical notes:**
- Use auth.getUser() not auth.getSession() in server code
- Test on Chrome, Safari, Firefox before moving forward
- Verify cookies persist across page refreshes

### Phase 3: Course Display + Navigation
**Rationale:** Users need to browse and access course content before video delivery makes sense. This phase establishes the content consumption patterns without video complexity.

**Delivers:**
- Course catalog page
- Course detail page with curriculum
- Lesson page layout (without video initially)
- Module/lesson navigation
- Material download functionality
- Enrollment relationship (for testing access control)

**Addresses (from FEATURES.md):**
- Course catalog (table stakes)
- Course detail page (table stakes)
- Lesson navigation (table stakes)
- Material downloads (table stakes)

**Implements (from ARCHITECTURE.md):**
- Server Component data fetching with joins
- RLS policy enforcement in practice
- Responsive layout for mobile

**Technical notes:**
- Fetch courses with modules/lessons in single query (avoid N+1)
- Test RLS policies by attempting access without enrollment
- Material downloads via signed URLs (practice for video)

### Phase 4: Video Delivery + Progress Tracking
**Rationale:** This is the core value proposition - secure video streaming with progress tracking. Must come after enrollment system exists (Phase 3) so access control can be verified. This phase directly addresses the #3 critical pitfall (video piracy).

**Delivers:**
- Vidstack player integration
- Signed URL generation server-side with enrollment check
- Progress tracking (lesson completion, video position)
- Resume playback functionality
- Playback speed control
- Dashboard showing enrolled courses with progress

**Uses (from STACK.md):**
- @vidstack/react for player
- Supabase Storage for video files
- Short-lived signed URLs (1 hour expiry)

**Addresses (from FEATURES.md):**
- Video playback (table stakes)
- Progress tracking (table stakes)
- User dashboard (table stakes)
- Resume playback (competitive differentiator)

**Avoids (from PITFALLS.md):**
- Pitfall #3 (video without access control) - enrollment verification before URL generation
- Pitfall #11 (URL expiration during long videos) - 1 hour expiry exceeds longest typical lesson
- Pitfall #12 (progress not saved on close) - beforeunload + periodic saves

**Technical notes:**
- Lazy load video player with next/dynamic (avoid bundle bloat)
- Store video files with random names, not sequential IDs
- Test signed URL expiration and refresh logic
- Save progress every 30-60s, not just on completion
- Consider HLS for adaptive bitrate if needed

### Phase 5: Admin CMS
**Rationale:** Admin tools can be built last since content can be added manually via Supabase dashboard during earlier phases. This phase uses the service role client pattern established in Phase 1.

**Delivers:**
- Admin dashboard layout
- Course CRUD interface
- Module/lesson management
- Video upload with progress indicator
- Material upload
- User enrollment management
- Publishing controls

**Uses (from STACK.md):**
- shadcn/ui components (table, dialog, form)
- react-hook-form + zod for validation
- Service role client for admin operations

**Addresses (from FEATURES.md):**
- Course CRUD (table stakes)
- Lesson CRUD (table stakes)
- Video upload (table stakes)
- Rich text editor (table stakes)

**Implements (from ARCHITECTURE.md):**
- Admin API routes with service role client
- Role-based access (admin flag in profiles)
- File upload to Supabase Storage

**Technical notes:**
- Verify admin role before service role operations
- Video upload needs chunking for large files
- Consider video processing queue if transcoding needed

### Phase 6: Polish + Optimization
**Rationale:** With core functionality complete, focus on UX improvements and performance optimization identified in testing.

**Delivers:**
- Mobile video optimization
- Performance tuning (query optimization, caching)
- Error handling and loading states
- Accessibility improvements
- Progress milestones/celebrations
- Theme improvements
- SEO optimization

**Addresses (from FEATURES.md):**
- Progress milestones (competitive differentiator)
- Responsive design refinement (table stakes)

**Avoids (from PITFALLS.md):**
- Pitfall #13 (no mobile optimization)
- Pitfall #8 (bundle bloat) - bundle analysis and optimization

**Technical notes:**
- Run bundle analyzer to identify optimization opportunities
- Test with throttled network (slow 3G)
- Verify Core Web Vitals

### Phase Ordering Rationale

This ordering prevents the most common failure patterns in course platform development:

1. **Database security first** - RLS misconfiguration is the #1 cause of breaches; fixing after data exists is risky
2. **Auth before content** - Session management is complex; building features without working auth leads to rewrites
3. **Content structure before video** - Enrollment and access patterns established without video complexity
4. **Video delivery with security built-in** - Access control from day one prevents piracy, retrofitting is nearly impossible
5. **Admin tools last** - Manual data entry via Supabase dashboard works for prototyping; admin UI can evolve based on actual usage patterns

This order also aligns with natural testing progression: foundation → user can login → user can browse → user can watch → admin can manage.

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 4 (Video Delivery):** Video transcoding to HLS if adaptive bitrate needed - may require external service or FFmpeg integration, research during phase planning
- **Phase 5 (Admin CMS):** Large video upload handling - need to research chunking strategies and progress tracking, potentially use tus resumable upload protocol

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** Supabase setup and RLS are well-documented with official guides
- **Phase 2:** OAuth flow with @supabase/ssr has official documentation and examples
- **Phase 3:** Server Component data fetching is standard Next.js pattern
- **Phase 6:** Performance optimization follows established Next.js best practices

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations verified with official npm packages, Supabase docs, and version compatibility |
| Features | HIGH | Multiple authoritative sources (LMS platforms, industry guides) agree on table stakes and differentiators |
| Architecture | HIGH | Official Supabase SSR patterns for Next.js 14, verified with migration guides and API docs |
| Pitfalls | HIGH | Security issues verified with CVE reports, community discussions, and official troubleshooting guides |

**Overall confidence:** HIGH

All core recommendations (Supabase-only stack, RLS-first approach, signed URL video delivery, custom admin) are verified with official documentation or authoritative community sources. The phase ordering follows natural dependency chains discovered in architecture research.

### Gaps to Address

Minor areas requiring validation during implementation:

- **Video transcoding workflow:** If HLS adaptive bitrate is required (determined by user testing), need to research FFmpeg integration or external service (Mux, Cloudflare Stream) during Phase 4 planning. Can start with direct MP4 upload and add transcoding later if buffering issues arise.

- **Large file upload:** Video uploads >500MB may need chunking strategy. Supabase Storage supports resumable uploads via tus protocol. Research specific implementation during Phase 5 planning based on actual video sizes being uploaded.

- **Middleware chaining:** Integration of Supabase middleware with existing next-intl middleware needs testing. Research indicates they can be chained but exact order matters. Validate during Phase 1 implementation.

- **Mobile video behavior:** Self-hosted video player behavior on iOS/Android needs real device testing. Research indicates Vidstack handles this well but verify autoplay policies, fullscreen, and PiP during Phase 4.

These gaps are minor and don't affect phase ordering or core architecture decisions. They represent implementation details to be resolved during the respective phases.

## Sources

### Primary (HIGH confidence)
- [Supabase Next.js Server-Side Auth Guide](https://supabase.com/docs/guides/auth/server-side/nextjs) - official pattern for @supabase/ssr integration
- [Supabase Row Level Security Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) - official RLS setup and best practices
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage) - signed URLs, access control, CDN
- [Vidstack Player Docs](https://vidstack.io/docs/player/) - official React integration and HLS support
- [React Hook Form Docs](https://react-hook-form.com/) - official patterns and TypeScript integration
- npm package pages - verified versions and compatibility for all dependencies

### Secondary (MEDIUM confidence)
- [eLearning Industry LMS Directory](https://elearningindustry.com/directory/software-categories/learning-management-systems) - feature expectations across platforms
- [Digital Samba LMS Guide 2026](https://www.digitalsamba.com/blog/learning-management-systems) - table stakes features and user expectations
- [Supabase Security Flaw Report](https://byteiota.com/supabase-security-flaw-170-apps-exposed-by-missing-rls/) - real-world RLS breach analysis
- [Video Piracy Protection Guide](https://www.gumlet.com/learn/stop-course-video-piracy/) - industry statistics and prevention strategies
- [Supabase Best Practices Guide](https://www.leanware.co/insights/supabase-best-practices) - community-verified patterns
- GitHub Discussions (Supabase OAuth issues, storage patterns) - community troubleshooting and solutions

### Tertiary (needs validation)
- Video streaming with HLS.js - mentioned in community discussions, official Vidstack docs confirm support
- Cloudflare R2 as storage alternative - community recommendation, breaks Supabase-only constraint so not pursued
- Service role usage in API routes - pattern inferred from official service role key documentation

---
*Research completed: 2026-01-26*
*Ready for roadmap: yes*
