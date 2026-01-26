# Roadmap: Mestres Course Platform

**Created:** 2026-01-26
**Depth:** Comprehensive
**Phases:** 6
**Total v1 Requirements:** 36

## Overview

This roadmap transforms the existing Next.js marketing landing page into a complete online course platform. The phase ordering follows security-first principles: database security before data exists, authentication before user features, content structure before video complexity, and admin tools last since Supabase dashboard can serve as interim solution.

The critical path addresses the top three risks identified in research: RLS misconfiguration (83% of breaches), video piracy (30% revenue loss), and OAuth callback issues (silent auth failures). Each phase delivers a verifiable capability that can be tested independently.

---

## Phase 1: Foundation + Database Security

**Goal:** Establish secure database foundation with RLS policies before any user data exists.

**Dependencies:** None (starting phase)

**Plans:** 4 plans in 2 waves

Plans:
- [ ] 01-01-PLAN.md — Install Supabase packages and create client utilities
- [ ] 01-02-PLAN.md — Create middleware for session refresh
- [ ] 01-03-PLAN.md — Create database schema with RLS policies
- [ ] 01-04-PLAN.md — Generate TypeScript types and verify security

**Requirements:**
- DATA-01: All tables have RLS enabled with policies
- DATA-03: Enrollment records track user-course access
- DATA-04: Progress records track lesson completion
- DATA-05: Policy columns have indexes for performance

**Success Criteria:**
1. User can connect to Supabase from both server and client components without errors
2. Attempting to query tables without authentication returns empty results (RLS working)
3. Supabase Security Advisor shows no warnings for any table
4. Database types are generated and TypeScript autocomplete works for all tables
5. Middleware refreshes session cookies on every request without errors

**Deliverables:**
- Supabase project configuration
- Client utilities (browser, server, admin clients in `lib/supabase/`)
- Middleware with session refresh
- Database schema (profiles, courses, modules, lessons, enrollments, progress)
- RLS policies on ALL tables
- Indexes on policy columns
- Generated TypeScript types

**Technical Notes:**
- Use @supabase/ssr (not deprecated auth-helpers)
- Enable RLS in same migration that creates each table
- Test Security Advisor before proceeding to Phase 2

---

## Phase 2: Authentication

**Goal:** Users can securely authenticate with OAuth and maintain sessions across browser refreshes.

**Dependencies:** Phase 1 (database, middleware, Supabase clients)

**Requirements:**
- AUTH-01: User can sign in with Google OAuth
- AUTH-02: User can sign in with GitHub OAuth
- AUTH-03: User session persists across browser refresh
- AUTH-04: User can sign out from any page
- AUTH-05: Protected routes redirect to login
- AUTH-06: Auth callback handles errors gracefully
- DATA-02: User profiles created on first login

**Success Criteria:**
1. User can complete Google OAuth flow and land on dashboard
2. User can complete GitHub OAuth flow and land on dashboard
3. Closing and reopening browser maintains logged-in state
4. Clicking logout from any page returns user to home page as guest
5. Visiting /dashboard without auth redirects to login page

**Deliverables:**
- OAuth provider configuration (Google, GitHub)
- Auth callback route with proper cookie handling
- Login/logout UI components
- Profile creation trigger (on first login)
- Protected route middleware logic
- User menu with auth state

**Technical Notes:**
- Use auth.getUser() not auth.getSession() in server code
- Test on Chrome, Safari, Firefox before moving forward
- Verify cookies persist across page refreshes

---

## Phase 3: Course Display + User Dashboard

**Goal:** Users can browse courses, view their enrolled content, and access lesson pages with materials.

**Dependencies:** Phase 2 (authentication, user profiles)

**Requirements:**
- DASH-01: Dashboard shows enrolled courses
- DASH-02: Each course shows completion percentage
- DASH-03: User can click course to continue learning
- DASH-04: User can view and edit profile (name, avatar)
- DASH-05: Dashboard accessible only when authenticated
- COUR-01: Course listing page shows all available courses
- COUR-02: Course detail page shows lessons and materials
- COUR-03: Enrolled users can access lesson content
- COUR-04: Non-enrolled users see course info but not content
- COUR-05: Course materials available for download (enrolled only)

**Success Criteria:**
1. User dashboard displays all enrolled courses with accurate completion percentages
2. User can navigate from dashboard to specific lesson in enrolled course
3. User can update profile name and avatar from settings page
4. Non-enrolled user can view course description but sees "Enroll" prompt instead of lessons
5. Enrolled user can download materials attached to lessons

**Deliverables:**
- Dashboard layout with course cards
- Course catalog page
- Course detail page with curriculum (modules/lessons)
- Lesson page layout (placeholder for video)
- Profile editing page
- Material download via signed URLs
- Enrollment verification in Server Components

**Technical Notes:**
- Fetch courses with modules/lessons in single query (avoid N+1)
- Test RLS policies by attempting access without enrollment
- Material downloads use signed URLs (practice for video)

---

## Phase 4: Video Delivery + Progress Tracking

**Goal:** Users can watch course videos with automatic progress tracking and resume capability.

**Dependencies:** Phase 3 (course display, enrollment verification)

**Requirements:**
- VIDE-01: Video player renders lesson content
- VIDE-02: Videos load via short-lived signed URLs
- VIDE-03: Video progress saves automatically (every 30s)
- VIDE-04: User can mark lesson as complete
- VIDE-05: Video player is lazy-loaded (not in main bundle)
- VIDE-06: Progress saves on page close (beforeunload)

**Success Criteria:**
1. Enrolled user can watch lesson video with standard controls (play, pause, seek, volume)
2. Returning to a lesson resumes from last watched position
3. Marking lesson complete updates dashboard progress percentage
4. Closing browser mid-lesson and returning preserves video position
5. Network tab shows video URLs expire (cannot reuse URL after 1 hour)

**Deliverables:**
- Vidstack player integration (lazy-loaded)
- Signed URL generation Server Action with enrollment check
- Progress tracking (video position saved every 30s)
- Lesson completion marking
- Resume playback functionality
- beforeunload progress save

**Technical Notes:**
- Lazy load video player with next/dynamic
- Store video files with random names, not sequential IDs
- Test signed URL expiration and refresh logic
- 1 hour URL expiry exceeds longest typical lesson

---

## Phase 5: Admin CMS

**Goal:** Admin can manage courses, lessons, videos, and enrollments without using Supabase dashboard.

**Dependencies:** Phase 4 (video delivery working, storage patterns established)

**Requirements:**
- ADMN-01: Admin can create new courses
- ADMN-02: Admin can edit course details (title, description, thumbnail)
- ADMN-03: Admin can add/remove lessons from course
- ADMN-04: Admin can upload video for lesson
- ADMN-05: Admin can upload materials/resources for lesson
- ADMN-06: Admin can view list of enrolled users
- ADMN-07: Admin can manually enroll/unenroll users
- ADMN-08: Rich text editor for course/lesson descriptions

**Success Criteria:**
1. Admin can create a new course with title, description, and thumbnail visible on catalog
2. Admin can add lessons to a course with video upload showing progress indicator
3. Admin can upload PDF/document materials attached to specific lessons
4. Admin can view all users enrolled in a course and remove enrollment
5. Course and lesson descriptions support rich text formatting (bold, lists, links)

**Deliverables:**
- Admin dashboard layout
- Course CRUD interface
- Module/lesson management
- Video upload with progress indicator
- Material upload
- User enrollment management
- Rich text editor (e.g., Tiptap or similar)
- Admin role verification

**Technical Notes:**
- Verify admin role before service role operations
- Video upload needs chunking for large files
- Use service role client for admin operations (bypasses RLS)

---

## Phase 6: Landing Page Polish + SEO + Performance

**Goal:** Landing page is fully functional with proper SEO, performance optimization, and polished UX.

**Dependencies:** Phase 5 (core platform complete)

**Requirements:**
- LAND-01: Theme toggle switches between dark and light mode
- LAND-02: Contact form sends email to admin
- LAND-03: Page achieves LCP < 2.5s (Core Web Vitals)
- LAND-04: All pages have proper meta tags and OG images
- LAND-05: Sitemap.xml and robots.txt configured
- LAND-06: 404 page exists with navigation back

**Success Criteria:**
1. Clicking theme toggle instantly switches between dark and light mode site-wide
2. Submitting contact form delivers email to admin inbox
3. Lighthouse performance score is 90+ with LCP < 2.5s
4. Sharing any page on social media shows correct title, description, and image
5. Visiting non-existent URL shows styled 404 page with link to home

**Deliverables:**
- Functional theme toggle (fix existing broken implementation)
- Contact form with email delivery (Resend or similar)
- Performance optimization (images, fonts, bundle)
- Meta tags and OG images for all pages
- Sitemap.xml and robots.txt
- Custom 404 page
- Core Web Vitals validation

**Technical Notes:**
- Run bundle analyzer to identify optimization opportunities
- Test with throttled network (slow 3G)
- Verify Core Web Vitals with PageSpeed Insights

---

## Progress

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 1 | Foundation + Database Security | DATA-01, DATA-03, DATA-04, DATA-05 | Planned |
| 2 | Authentication | AUTH-01 to AUTH-06, DATA-02 | Not Started |
| 3 | Course Display + User Dashboard | DASH-01 to DASH-05, COUR-01 to COUR-05 | Not Started |
| 4 | Video Delivery + Progress Tracking | VIDE-01 to VIDE-06 | Not Started |
| 5 | Admin CMS | ADMN-01 to ADMN-08 | Not Started |
| 6 | Landing Page Polish + SEO + Performance | LAND-01 to LAND-06 | Not Started |

**Total:** 0/36 requirements complete (0%)

---

## Coverage Validation

| Category | Requirements | Phase | Count |
|----------|--------------|-------|-------|
| DATA | DATA-01, DATA-03, DATA-04, DATA-05 | Phase 1 | 4 |
| AUTH | AUTH-01 to AUTH-06 | Phase 2 | 6 |
| DATA | DATA-02 | Phase 2 | 1 |
| DASH | DASH-01 to DASH-05 | Phase 3 | 5 |
| COUR | COUR-01 to COUR-05 | Phase 3 | 5 |
| VIDE | VIDE-01 to VIDE-06 | Phase 4 | 6 |
| ADMN | ADMN-01 to ADMN-08 | Phase 5 | 8 |
| LAND | LAND-01 to LAND-06 | Phase 6 | 6 |

**Mapped:** 36/36
**Unmapped:** 0

---
*Roadmap created: 2026-01-26*
*Last updated: 2026-01-26*
