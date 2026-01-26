# Domain Pitfalls: Online Course Platform

**Domain:** Online course platform with video streaming
**Stack:** Next.js 14 + Supabase + Self-hosted video
**Researched:** 2026-01-26
**Confidence:** HIGH (verified against official docs and multiple sources)

---

## Critical Pitfalls

Mistakes that cause security breaches, rewrites, or major production issues.

---

### Pitfall 1: RLS Not Enabled on Tables (Data Exposure)

**What goes wrong:** Your entire database becomes publicly accessible via the Supabase REST API. The `anon` key embedded in your client-side code becomes a master key to all data.

**Why it happens:** RLS is **disabled by default** when you create tables in Supabase. Developers prototype quickly without security, then forget to enable it before launch. 83% of exposed Supabase databases involve RLS misconfigurations. In 2025, CVE-2025-48757 exposed 170+ applications due to missing RLS.

**Consequences:**
- Complete data breach (user emails, payment info, course content)
- Users can read/modify other users' data
- Course content accessible without enrollment
- Legal liability (GDPR, etc.)

**Prevention:**
1. Enable RLS on EVERY table from day one: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. Create at least one policy per table immediately after enabling RLS
3. Run Supabase Security Advisor in dashboard before every deployment
4. Never use `service_role` key in client code

**Detection (Warning Signs):**
- Can access data without being logged in
- Users can see other users' courses/progress
- No policies visible in Supabase dashboard under Authentication > Policies

**Phase to Address:** Phase 1 (Database Setup) - Do this FIRST, before any other work.

**Sources:**
- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Security Flaw Report](https://byteiota.com/supabase-security-flaw-170-apps-exposed-by-missing-rls/)
- [RLS Best Practices](https://www.leanware.co/insights/supabase-best-practices)

---

### Pitfall 2: RLS Enabled Without Policies (Complete Lockout)

**What goes wrong:** After enabling RLS, NO ONE can access the data - not even authenticated users. Your app appears broken with empty responses.

**Why it happens:** Enabling RLS without creating policies creates a "deny all" default. Developers enable RLS but forget that policies are required for ANY access.

**Consequences:**
- App shows no data despite data existing in tables
- API returns empty arrays/null
- Confusing debugging sessions
- Temptation to disable RLS "temporarily" (dangerous)

**Prevention:**
```sql
-- ALWAYS pair RLS enable with at least one policy
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Immediately create read policy
CREATE POLICY "Users can view courses they're enrolled in"
ON courses FOR SELECT
USING (
  id IN (
    SELECT course_id FROM enrollments
    WHERE user_id = auth.uid()
  )
);
```

**Detection:**
- Data exists in Supabase dashboard but API returns empty
- Works with `service_role` key but not `anon` key
- Error logs show permission denied

**Phase to Address:** Phase 1 (Database Setup)

---

### Pitfall 3: Unsafe JWT Claims in RLS Policies

**What goes wrong:** Using `user_metadata` in RLS policies allows users to modify their own permissions and access any data.

**Why it happens:** Developers use `auth.jwt()->>'user_metadata'->>'role'` not realizing that `user_metadata` can be modified by the user themselves.

**Consequences:**
- Users can elevate their own privileges
- Course content accessible without payment
- Admin functions accessible to regular users

**Prevention:**
```sql
-- BAD: user_metadata is user-modifiable
CREATE POLICY "admin_only" ON courses FOR ALL
USING (auth.jwt()->>'user_metadata'->>'role' = 'admin');

-- GOOD: Use app_metadata (server-only) or database lookup
CREATE POLICY "admin_only" ON courses FOR ALL
USING (
  auth.uid() IN (SELECT user_id FROM admins)
);
```

**Detection:**
- Security audit reveals user_metadata in policies
- Users report accessing content they shouldn't

**Phase to Address:** Phase 2 (Authentication) - When setting up user roles.

**Source:** [Supabase Token Security](https://supabase.com/docs/guides/auth/oauth-server/token-security)

---

### Pitfall 4: Self-Hosted Video Without Access Control

**What goes wrong:** Video URLs are guessable or permanently valid. Once a user finds a video URL, they can share it freely or download all course content.

**Why it happens:**
- Using public cloud storage buckets
- Signed URLs with very long expiration (years)
- No per-user access verification
- URLs follow predictable patterns (course-1-video-1.mp4)

**Consequences:**
- Course piracy via Telegram/Discord groups
- Revenue loss (estimated 30% from password/URL sharing)
- No way to identify who leaked content
- Competitive disadvantage as content spreads freely

**Prevention:**
1. Use short-lived signed URLs (15-60 minutes max)
2. Generate URLs per-session, per-user
3. Verify enrollment before generating URL:
```typescript
// In API route or server action
async function getVideoUrl(courseId: string, lessonId: string) {
  const user = await getUser();

  // VERIFY enrollment in database
  const enrollment = await supabase
    .from('enrollments')
    .select()
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single();

  if (!enrollment) throw new Error('Not enrolled');

  // Generate short-lived URL
  const { data } = await supabase.storage
    .from('videos')
    .createSignedUrl(`${courseId}/${lessonId}.mp4`, 3600); // 1 hour

  return data.signedUrl;
}
```

4. Use randomized file names, not sequential
5. Consider DRM for high-value content (Widevine/FairPlay)

**Detection:**
- Analytics show same video played from multiple IPs simultaneously
- Content appears on piracy sites
- Signed URLs work after user subscription expires

**Phase to Address:** Phase 3 (Video Delivery) - This is the core value proposition.

**Sources:**
- [Supabase Storage Signed URLs](https://supabase.com/docs/reference/javascript/storage-from-createsignedurl)
- [Video Piracy Protection Guide](https://www.gumlet.com/learn/stop-course-video-piracy/)
- [DRM Protection Guide](https://inkryptvideos.com/screen-recording-protection-with-drm-in-2025/)

---

### Pitfall 5: OAuth Callback Cookie Issues (Auth Breaks Silently)

**What goes wrong:** Users complete OAuth flow (Google/GitHub) but session cookies don't set properly. They appear logged in momentarily, then get logged out on refresh or navigation.

**Why it happens:**
- Using `@supabase/supabase-js` instead of `@supabase/ssr` for server-side
- Missing `exchangeCodeForSession` in callback route
- Next.js route prefetching sends server requests before cookies are set
- Cookie SameSite/Secure attributes misconfigured

**Consequences:**
- Users can't complete signup/login
- Support tickets about "login doesn't work"
- Users abandon the platform
- Intermittent issues (works for some users, not others)

**Prevention:**
1. Use `@supabase/ssr` package (not `@supabase/auth-helpers` - deprecated)
2. Create proper callback route:
```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return to error page on failure
  return NextResponse.redirect(`${origin}/auth/error`)
}
```

3. Update email templates for PKCE flow (token_hash instead of ConfirmationURL)
4. Redirect OAuth users to a dedicated page without route prefetching
5. Create separate Supabase clients for Server Components vs Client Components

**Detection:**
- Users report "login works then logs out"
- `sb-access-token` cookie not present after OAuth
- Works locally but fails in production
- Works in Chrome but not Safari

**Phase to Address:** Phase 2 (Authentication) - Test thoroughly before moving on.

**Sources:**
- [Supabase Auth Troubleshooting](https://supabase.com/docs/guides/troubleshooting/how-do-you-troubleshoot-nextjs---supabase-auth-issues-riMCZV)
- [OAuth Cookie Issues Discussion](https://github.com/orgs/supabase/discussions/6391)
- [Supabase SSR Package](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or performance issues.

---

### Pitfall 6: RLS Performance Issues (Slow Page Loads)

**What goes wrong:** Pages with course listings or progress tracking take 3-10+ seconds to load. Database queries that worked fine in development crawl in production.

**Why it happens:**
- RLS policies are evaluated for EVERY row
- Calling functions directly in policies (evaluated per-row)
- Missing indexes on columns used in policies
- Complex joins in policy conditions

**Prevention:**
1. Index ALL columns used in RLS policies:
```sql
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_progress_user_course ON progress(user_id, course_id);
```

2. Wrap auth functions to enable caching:
```sql
-- BAD: Called for each row
CREATE POLICY "..." USING (auth.uid() = user_id);

-- BETTER: Cached via initPlan
CREATE POLICY "..." USING (
  user_id = (SELECT auth.uid())
);
```

3. Use Supabase's `index_advisor` extension to find missing indexes
4. Test with production-sized data (not 10 test rows)

**Detection:**
- `EXPLAIN ANALYZE` shows sequential scans
- Queries slow only when RLS is enabled
- Performance degrades as user count grows

**Phase to Address:** Phase 4 (Optimization) - But design for it in Phase 1.

**Source:** [Supabase RLS Performance](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv)

---

### Pitfall 7: Views Bypass RLS (Accidental Data Exposure)

**What goes wrong:** You create a view for convenience, and it exposes all data regardless of RLS policies on underlying tables.

**Why it happens:** PostgreSQL creates views with `security definer` by default, meaning they run as the view creator (usually postgres), bypassing all RLS.

**Prevention:**
```sql
-- For Postgres 15+, use security_invoker
CREATE VIEW course_summaries
WITH (security_invoker = true) AS
SELECT id, title, description FROM courses;

-- For older versions, avoid views for user-facing queries
-- Or explicitly handle security in the view definition
```

**Detection:**
- Users see more data through views than direct table queries
- Security audit reveals views without security_invoker

**Phase to Address:** Phase 1 (Database Setup) - Avoid views initially, add carefully later.

---

### Pitfall 8: Video Player Bundle Bloat (Slow Initial Load)

**What goes wrong:** First page load takes 5-10+ seconds. Core Web Vitals fail. Users abandon before seeing content.

**Why it happens:**
- Video player libraries (Video.js, Plyr) are 100-300KB+
- Importing player at top level includes it in main bundle
- Custom players with many features add more weight
- Multiple video formats and codecs bundled together

**Prevention:**
1. Lazy load video player with `next/dynamic`:
```typescript
import dynamic from 'next/dynamic'

const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {
  loading: () => <div className="aspect-video bg-gray-900 animate-pulse" />,
  ssr: false // Video players usually need client-side only
})
```

2. Use `next/bundle-analyzer` to identify heavy dependencies
3. Defer video loading until user scrolls to it (Intersection Observer)
4. Consider lighter alternatives (native HTML5 video for basic needs)

**Detection:**
- Bundle analyzer shows video libs in main chunk
- LCP > 2.5s on course pages
- Lighthouse reports large JavaScript payload

**Phase to Address:** Phase 3 (Video Delivery)

**Source:** [Next.js Bundle Optimization](https://www.catchmetrics.io/blog/optimizing-nextjs-performance-bundles-lazy-loading-and-images)

---

### Pitfall 9: N+1 Queries for Course Progress

**What goes wrong:** Course listing page makes 50+ database queries - one for each course to check completion status. Page load times increase linearly with number of courses.

**Why it happens:**
- Fetching course list, then fetching progress for each course separately
- React Server Components making individual queries per component
- Not using joins or batch queries

**Prevention:**
```typescript
// BAD: N+1 queries
const courses = await getCourses();
const progress = await Promise.all(
  courses.map(c => getProgress(c.id)) // N additional queries!
);

// GOOD: Single query with join
const coursesWithProgress = await supabase
  .from('courses')
  .select(`
    *,
    enrollments!inner(
      completed_lessons,
      total_lessons
    )
  `)
  .eq('enrollments.user_id', userId);
```

**Detection:**
- Supabase dashboard shows many queries per page load
- Page speed correlates with number of courses
- Database CPU spikes during page loads

**Phase to Address:** Phase 4 (Optimization) - Design schema to prevent in Phase 1.

---

### Pitfall 10: No Video Adaptive Bitrate (ABR) Support

**What goes wrong:** Users on slow connections experience constant buffering. Users on fast connections get unnecessarily low quality. Mobile users burn through data.

**Why it happens:**
- Serving single-quality video files
- Not transcoding to multiple resolutions
- Using basic HTML5 video without HLS/DASH

**Prevention:**
1. Transcode videos to multiple qualities (360p, 720p, 1080p)
2. Use HLS (HTTP Live Streaming) format with manifest files
3. Consider video processing services (Mux, Cloudflare Stream) if self-hosting is complex
4. Implement quality selector in player

**Detection:**
- Support tickets about buffering
- Analytics show high abandonment mid-video
- No quality options in video player

**Phase to Address:** Phase 3 (Video Delivery) - May require dedicated video service.

**Source:** [Video Hosting Best Practices](https://www.schoolmaker.com/blog/video-hosting-platforms-for-online-courses)

---

## Minor Pitfalls

Mistakes that cause annoyance but are fixable without major refactoring.

---

### Pitfall 11: Signed URL Expiration During Long Videos

**What goes wrong:** User starts watching a 2-hour course video. After 1 hour, video stops with an error because the signed URL expired.

**Prevention:**
- Set URL expiration longer than longest video (plus buffer)
- Implement URL refresh before expiration
- Use video player that supports playlist with multiple URLs
- Show warning before URL expires with option to refresh

**Phase to Address:** Phase 3 (Video Delivery)

---

### Pitfall 12: Missing Progress Save on Page Close

**What goes wrong:** User watches 45 minutes of a video, closes browser, returns to find progress at 0:00.

**Prevention:**
1. Save progress every 30-60 seconds automatically
2. Use `beforeunload` event as backup:
```typescript
useEffect(() => {
  const handleBeforeUnload = () => {
    // Use sendBeacon for reliable delivery during page unload
    navigator.sendBeacon('/api/save-progress', JSON.stringify({
      lessonId,
      timestamp: videoRef.current?.currentTime
    }));
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [lessonId]);
```

3. Store progress in localStorage as fallback

**Phase to Address:** Phase 3 (Video Delivery)

---

### Pitfall 13: No Mobile Video Optimization

**What goes wrong:** Videos auto-play on mobile, consuming data. Portrait mode shows tiny video. Touch controls don't work well.

**Prevention:**
- Never autoplay on mobile
- Use responsive aspect-ratio containers
- Implement touch-friendly controls
- Provide download option for offline viewing (if allowed)
- Test on actual mobile devices, not just browser emulation

**Phase to Address:** Phase 5 (Polish)

---

### Pitfall 14: Course Content Accessible After Subscription Expires

**What goes wrong:** Subscription-based access isn't enforced. Users continue accessing content after cancellation.

**Prevention:**
1. Check subscription status in RLS policies, not just enrollment
2. Include expiration date in enrollment records
3. Verify on every video URL generation, not just initial enrollment

```sql
CREATE POLICY "Active subscriptions only" ON lessons FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM enrollments e
    JOIN subscriptions s ON e.user_id = s.user_id
    WHERE e.course_id = lessons.course_id
    AND e.user_id = auth.uid()
    AND s.status = 'active'
    AND s.current_period_end > now()
  )
);
```

**Phase to Address:** Phase 2 (Authentication) when implementing payment integration.

---

## Phase-Specific Warnings

| Phase | Topic | Likely Pitfall | Mitigation |
|-------|-------|----------------|------------|
| Phase 1 | Database Schema | RLS disabled or misconfigured | Enable RLS + create policies immediately |
| Phase 1 | Database Schema | No indexes on policy columns | Add indexes before adding data |
| Phase 2 | Auth Setup | OAuth cookies not setting | Use `@supabase/ssr`, test on multiple browsers |
| Phase 2 | Auth Setup | Using user_metadata for roles | Use app_metadata or database lookups |
| Phase 3 | Video Delivery | Public or long-lived URLs | Short-lived signed URLs with enrollment check |
| Phase 3 | Video Delivery | Video player in main bundle | Dynamic import with ssr: false |
| Phase 3 | Video Delivery | No adaptive streaming | HLS/DASH with multiple qualities |
| Phase 4 | Progress Tracking | N+1 queries on course pages | Use joins, batch queries |
| Phase 4 | Optimization | RLS slowing queries | Index policy columns, cache auth.uid() |
| Phase 5 | Polish | Mobile video UX issues | Test on real devices early |

---

## Pre-Launch Checklist

Before going to production:

- [ ] Run Supabase Security Advisor (dashboard)
- [ ] Verify RLS enabled on ALL tables
- [ ] Test as unauthenticated user - should see nothing sensitive
- [ ] Test as different user - should NOT see other user's data
- [ ] Verify signed URLs expire appropriately
- [ ] Test OAuth flow end-to-end in production environment
- [ ] Run EXPLAIN ANALYZE on main queries
- [ ] Test with throttled network (slow 3G)
- [ ] Verify video progress saves on page close
- [ ] Check bundle size with next/bundle-analyzer
- [ ] Test subscription expiration enforcement

---

## Sources

### Official Documentation (HIGH confidence)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase Auth Sessions](https://supabase.com/docs/guides/auth/sessions)
- [Supabase Performance Tuning](https://supabase.com/docs/guides/platform/performance)
- [Next.js Optimization Guide](https://nextjs.org/docs/14/app/building-your-application/optimizing)

### Security Research (MEDIUM confidence)
- [170+ Apps Exposed by Missing RLS](https://byteiota.com/supabase-security-flaw-170-apps-exposed-by-missing-rls/)
- [Video Piracy Protection](https://www.gumlet.com/learn/stop-course-video-piracy/)
- [DRM Protection Guide 2026](https://inkryptvideos.com/screen-recording-protection-with-drm-in-2025/)

### Community Discussions (MEDIUM confidence)
- [OAuth Cookie Issues](https://github.com/orgs/supabase/discussions/6391)
- [Signed URL Security](https://github.com/orgs/supabase/discussions/3564)
- [Storage Tradeoffs](https://github.com/orgs/supabase/discussions/6458)

### Best Practices Guides (MEDIUM confidence)
- [Supabase Best Practices](https://www.leanware.co/insights/supabase-best-practices)
- [Next.js Bundle Optimization](https://www.catchmetrics.io/blog/optimizing-nextjs-performance-bundles-lazy-loading-and-images)
- [Video Hosting Platforms Guide](https://www.schoolmaker.com/blog/video-hosting-platforms-for-online-courses)
