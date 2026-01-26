# Requirements: Mestres Course Platform

**Defined:** 2026-01-26
**Core Value:** Users can access and watch premium course content seamlessly after authenticating

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Landing Page (Existing - Polish)

- [ ] **LAND-01**: Theme toggle switches between dark and light mode
- [ ] **LAND-02**: Contact form sends email to admin
- [ ] **LAND-03**: Page achieves LCP < 2.5s (Core Web Vitals)
- [ ] **LAND-04**: All pages have proper meta tags and OG images
- [ ] **LAND-05**: Sitemap.xml and robots.txt configured
- [ ] **LAND-06**: 404 page exists with navigation back

### Authentication

- [ ] **AUTH-01**: User can sign in with Google OAuth
- [ ] **AUTH-02**: User can sign in with GitHub OAuth
- [ ] **AUTH-03**: User session persists across browser refresh
- [ ] **AUTH-04**: User can sign out from any page
- [ ] **AUTH-05**: Protected routes redirect to login
- [ ] **AUTH-06**: Auth callback handles errors gracefully

### Database & Security

- [ ] **DATA-01**: All tables have RLS enabled with policies
- [ ] **DATA-02**: User profiles created on first login
- [ ] **DATA-03**: Enrollment records track user-course access
- [ ] **DATA-04**: Progress records track lesson completion
- [ ] **DATA-05**: Policy columns have indexes for performance

### User Dashboard

- [ ] **DASH-01**: Dashboard shows enrolled courses
- [ ] **DASH-02**: Each course shows completion percentage
- [ ] **DASH-03**: User can click course to continue learning
- [ ] **DASH-04**: User can view and edit profile (name, avatar)
- [ ] **DASH-05**: Dashboard accessible only when authenticated

### Course System

- [ ] **COUR-01**: Course listing page shows all available courses
- [ ] **COUR-02**: Course detail page shows lessons and materials
- [ ] **COUR-03**: Enrolled users can access lesson content
- [ ] **COUR-04**: Non-enrolled users see course info but not content
- [ ] **COUR-05**: Course materials available for download (enrolled only)

### Video Delivery

- [ ] **VIDE-01**: Video player renders lesson content
- [ ] **VIDE-02**: Videos load via short-lived signed URLs
- [ ] **VIDE-03**: Video progress saves automatically (every 30s)
- [ ] **VIDE-04**: User can mark lesson as complete
- [ ] **VIDE-05**: Video player is lazy-loaded (not in main bundle)
- [ ] **VIDE-06**: Progress saves on page close (beforeunload)

### Admin CMS

- [ ] **ADMN-01**: Admin can create new courses
- [ ] **ADMN-02**: Admin can edit course details (title, description, thumbnail)
- [ ] **ADMN-03**: Admin can add/remove lessons from course
- [ ] **ADMN-04**: Admin can upload video for lesson
- [ ] **ADMN-05**: Admin can upload materials/resources for lesson
- [ ] **ADMN-06**: Admin can view list of enrolled users
- [ ] **ADMN-07**: Admin can manually enroll/unenroll users
- [ ] **ADMN-08**: Rich text editor for course/lesson descriptions

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Payments

- **PAY-01**: User can purchase course via Stripe
- **PAY-02**: Successful payment creates enrollment
- **PAY-03**: User receives confirmation email after purchase
- **PAY-04**: Admin can view payment history

### Notifications

- **NOTF-01**: User receives email on enrollment
- **NOTF-02**: User receives email on new lesson added to enrolled course
- **NOTF-03**: Admin receives email on new enrollment

### Advanced Features

- **ADVN-01**: User can leave comments on lessons
- **ADVN-02**: User can rate courses
- **ADVN-03**: Certificate generation on course completion
- **ADVN-04**: Multi-instructor support

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Email/password auth | OAuth simpler, better UX, no password management |
| Live sessions/webinars | Different infrastructure, high complexity |
| Discussion forums | Moderation overhead, not core value |
| Mobile native app | Web-first approach, PWA possible later |
| Complex quizzes | Not needed for video course platform |
| Subscription model | One-time access simpler for v1 |
| Multi-language courses | i18n for UI only, content in PT-BR |
| Real-time chat | High complexity, not core value |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAND-01 | Phase 6 | Pending |
| LAND-02 | Phase 6 | Pending |
| LAND-03 | Phase 6 | Pending |
| LAND-04 | Phase 6 | Pending |
| LAND-05 | Phase 6 | Pending |
| LAND-06 | Phase 6 | Pending |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 2 | Pending |
| AUTH-06 | Phase 2 | Pending |
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 2 | Pending |
| DATA-03 | Phase 1 | Pending |
| DATA-04 | Phase 1 | Pending |
| DATA-05 | Phase 1 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 3 | Pending |
| DASH-03 | Phase 3 | Pending |
| DASH-04 | Phase 3 | Pending |
| DASH-05 | Phase 3 | Pending |
| COUR-01 | Phase 3 | Pending |
| COUR-02 | Phase 3 | Pending |
| COUR-03 | Phase 3 | Pending |
| COUR-04 | Phase 3 | Pending |
| COUR-05 | Phase 3 | Pending |
| VIDE-01 | Phase 4 | Pending |
| VIDE-02 | Phase 4 | Pending |
| VIDE-03 | Phase 4 | Pending |
| VIDE-04 | Phase 4 | Pending |
| VIDE-05 | Phase 4 | Pending |
| VIDE-06 | Phase 4 | Pending |
| ADMN-01 | Phase 5 | Pending |
| ADMN-02 | Phase 5 | Pending |
| ADMN-03 | Phase 5 | Pending |
| ADMN-04 | Phase 5 | Pending |
| ADMN-05 | Phase 5 | Pending |
| ADMN-06 | Phase 5 | Pending |
| ADMN-07 | Phase 5 | Pending |
| ADMN-08 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 36 total
- Mapped to phases: 36
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-26*
*Last updated: 2026-01-26 after initial definition*
