# Feature Landscape: Online Course Platform

**Domain:** Online Course Platform / Learning Management System (LMS)
**Target Market:** Portuguese/Brazilian audience
**Researched:** 2026-01-26
**Confidence:** HIGH (multiple authoritative sources cross-referenced)

---

## Table Stakes

Features users expect. Missing = product feels incomplete or unprofessional.

### User-Facing Features

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **User Authentication** | Users need accounts to track progress | Medium | Database, Auth provider | OAuth (Google) is standard; reduces friction vs email/password |
| **User Dashboard** | Central hub for enrolled courses | Medium | Auth, Course enrollment | Shows "My Courses", progress at a glance |
| **Progress Tracking** | Users want to see how far they've come | Medium | Database, Video player events | Per-lesson completion status, overall % complete |
| **Video Playback** | Core content delivery mechanism | High | Video hosting, Player integration | Must work on all devices; buffering = churn |
| **Course Catalog** | Users need to browse available courses | Low | Course data model | Card grid with thumbnails, descriptions |
| **Course Detail Page** | Preview before enrolling/purchasing | Low | Course + Lesson data | Curriculum outline, instructor info, duration |
| **Lesson Navigation** | Move through course content | Low | Course structure | Previous/Next buttons, sidebar curriculum |
| **Profile Management** | Basic account customization | Low | Auth, Storage | Name, avatar upload, email display |
| **Responsive Design** | 50%+ traffic is mobile | Medium | CSS/Layout | Mobile-first approach mandatory |
| **Material Downloads** | Supplementary learning resources | Medium | Storage, File management | PDFs, worksheets, code samples |

### Content/Course Features

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **Video Lessons** | Primary content type for courses | High | Video hosting, Encoding | HLS for adaptive streaming recommended |
| **Lesson Descriptions** | Context before watching | Low | Rich text storage | Markdown or basic HTML |
| **Course Thumbnails** | Visual browsing | Low | Image storage | Consistent aspect ratio (16:9 recommended) |
| **Curriculum Structure** | Organize lessons into modules/sections | Medium | Hierarchical data model | Module > Lesson pattern |
| **Resource Attachments** | Per-lesson downloadables | Medium | Storage, UI | Tied to specific lessons |

### Admin Features

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **Course CRUD** | Create and manage courses | Medium | Database, Admin auth | Title, description, thumbnail, status |
| **Lesson CRUD** | Add/edit/delete lessons | High | Database, Video upload | Order management, video processing |
| **Video Upload** | Get content into the platform | High | Storage, Processing | Progress indicator, format validation |
| **User List** | See who's enrolled | Low | Database queries | Basic search/filter |
| **Rich Text Editor** | Format course/lesson descriptions | Medium | Editor library | TipTap or Slate recommended |
| **Admin Authentication** | Separate from regular users | Medium | Role-based access | Admin flag or separate role table |

---

## Differentiators

Features that set product apart. Not strictly expected, but create competitive advantage.

### Engagement Differentiators

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **Interactive Video Player** | Quizzes, hotspots inside videos | Very High | Custom player, Quiz engine | LearnWorlds' key differentiator; complex to build |
| **Gamification (Badges/Points)** | Motivation through achievement | Medium | Badge system, UI | Completion badges, streak tracking |
| **Progress Milestones** | Celebrate achievements | Low | Progress tracking | 25%, 50%, 75%, 100% celebrations |
| **Bookmarking/Notes** | Personalized learning | Medium | Database, UI | Note-taking per lesson |
| **Playback Speed Control** | Self-paced learning | Low | Video player config | 0.5x - 2x speed options |
| **Resume Playback** | Continue where left off | Medium | Video position tracking | Save/restore video timestamp |
| **Keyboard Shortcuts** | Power user productivity | Low | Event handlers | Space=pause, arrows=seek |

### Personalization Differentiators

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **Learning Paths** | Guided course sequences | High | Path data model, Recommendations | "Complete Course A before B" |
| **Course Recommendations** | Personalized suggestions | High | Analytics, Algorithm | Based on history, similar users |
| **Custom Dashboard Widgets** | Tailored experience | Medium | Widget system | Drag/drop layout |
| **Dark/Light Theme** | Comfort preference | Low | Theme system | Already partially implemented |

### Social Differentiators

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **Q&A per Lesson** | Get help without leaving context | Medium | Comments system | Instructor can answer; not full forum |
| **Community Space** | Peer learning, networking | High | Forum/Chat system | Significant moderation burden |
| **Student Showcase** | Share completed projects | Medium | Submission system | Portfolio feature |

### Admin Differentiators

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **Analytics Dashboard** | Understand learner behavior | High | Event tracking, Charts | Completion rates, drop-off points |
| **Email Notifications** | Re-engage learners | Medium | Email service integration | Completion reminders, new content alerts |
| **Bulk User Management** | Scale operations | Medium | CSV import, batch actions | Enroll/remove multiple users |
| **Content Scheduling** | Drip content over time | Medium | Scheduler, Lesson dates | Lesson available after X days |
| **Video Analytics** | Per-video engagement data | High | Video event tracking | Watch time, rewind points, drop-off |

### Localization Differentiators (Relevant for PT-BR Market)

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **Full PT-BR Interface** | Native experience | Low | i18n (already in place) | Error messages, emails too |
| **Brazilian Payment Methods** | PIX, Boleto support | High | Payment provider | Hotmart native advantage |
| **Time Zone Handling** | BRT/BRST awareness | Low | Date library | For scheduled content |
| **Currency Formatting** | R$ display | Low | i18n formatting | Already standard in next-intl |

---

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Live Chat/Webinars (v1)** | Different infrastructure (WebRTC/Zoom), moderation complexity, scheduling overhead | Focus on async video content; live can be v2+ |
| **Full Discussion Forums** | High moderation burden, spam risk, can become ghost town | Simple per-lesson Q&A with instructor response only |
| **Email/Password Auth** | Password reset flows, security concerns, friction | OAuth-only (Google/GitHub) for v1 |
| **Complex Quiz Engine** | Scope creep, many edge cases | Simple completion checkboxes; quizzes can be v2 |
| **Marketplace/Multi-Instructor** | Adds payment splits, instructor management, legal complexity | Single admin/instructor for v1 |
| **Subscription Billing** | Recurring payment complexity, dunning, churn management | One-time access or free for v1; Stripe later |
| **AI-Generated Content** | Content quality issues, factual errors | Manually curated content only |
| **Locked Navigation** | Frustrates learners, increases abandonment | Allow free navigation; track progress separately |
| **Certificate Generation** | Design, PDF generation, verification system | Manual certificates via email if needed; automate later |
| **Mobile Native Apps** | Doubles development effort, app store approval | PWA capabilities if needed; native apps v2+ |
| **Comments Without Moderation** | Spam, harassment risk | Either no comments or instructor-only responses |
| **Complex Gamification** | Leaderboards can demotivate, points can feel hollow | Simple badges/milestones only |
| **Content Overload UX** | Overwhelming learners reduces completion | Clean UI with focused navigation |
| **Autoplay Next Lesson** | Can miss important content, accessibility concern | Play/Pause user-controlled; suggest next |

---

## Feature Dependencies

Understanding what must be built before other features work.

```
Authentication (OAuth)
    └── User Dashboard
        └── Progress Tracking
        └── Course Enrollment
        └── Material Downloads
        └── Profile Management
    └── Admin Access
        └── Course CRUD
            └── Lesson CRUD
                └── Video Upload
                └── Material Upload
            └── Publishing Controls

Database Schema
    └── Course Model
        └── Lesson Model
            └── Resource/Material Model
    └── User Model
        └── Enrollment Model
        └── Progress Model

Storage (Supabase)
    └── Video Hosting
        └── Video Player Integration
    └── Material Downloads
    └── Avatar Upload
    └── Thumbnail Upload

Video Player
    └── Playback Controls
    └── Progress Events
        └── Lesson Completion
        └── Resume Playback
    └── Speed Control
```

### Critical Path

The minimum viable path to "users can watch courses":

1. **Auth** - Users can log in
2. **Database Schema** - Store courses, lessons, users
3. **Course Catalog** - Browse available courses
4. **Video Player** - Watch lessons
5. **Progress Tracking** - Know what's complete

Everything else builds on this foundation.

---

## MVP Recommendation

Based on the PROJECT.md requirements and this research:

### Phase 1: Authentication + Foundation
**Must have (Table Stakes):**
1. OAuth login (Google)
2. User session persistence
3. Protected routes
4. Basic user profile

### Phase 2: Course Viewing
**Must have (Table Stakes):**
1. Course catalog page
2. Course detail page with curriculum
3. Video player with basic controls
4. Lesson navigation
5. Progress tracking (lesson completion)

### Phase 3: User Dashboard
**Must have (Table Stakes):**
1. Dashboard layout
2. Enrolled courses display
3. Progress visualization
4. Material downloads

### Phase 4: Admin CMS
**Must have (Table Stakes):**
1. Admin authentication/role
2. Course CRUD
3. Lesson management
4. Video upload
5. Material upload

### Defer to Post-MVP

| Feature | Reason to Defer |
|---------|-----------------|
| GitHub OAuth | Google covers 90%+ of use case |
| Analytics Dashboard | Nice-to-have; raw SQL queries work initially |
| Gamification | Not critical for core value delivery |
| Learning Paths | Requires multiple courses to be meaningful |
| Q&A/Comments | Moderation burden; email support instead |
| Email Notifications | Can notify manually; automate later |
| Certificates | Manual via email if needed |
| Playback Resume | Improves UX but not critical for launch |

---

## Competitive Landscape Reference

### Platforms Users Compare Against

| Platform | Strengths | Weakness for PT-BR |
|----------|-----------|-------------------|
| **Hotmart** | Brazilian native, PIX/Boleto, massive market | Platform fee, less control |
| **Teachable** | Easy setup, good course player | US-focused, transaction fees |
| **Thinkific** | No transaction fees, strong quizzes | Less i18n, not PT-BR native |
| **Udemy** | Massive audience | Pricing control, 50%+ revenue cut |

### Differentiation Opportunity

For a self-hosted platform targeting PT-BR:
- Full Portuguese interface (beyond just translation)
- No platform fees (own hosting)
- Complete branding control
- Direct student relationship
- Custom domain

---

## Sources

**General LMS Features:**
- [eLearning Industry - LMS Directory](https://elearningindustry.com/directory/software-categories/learning-management-systems)
- [Digital Samba - LMS Complete Guide 2026](https://www.digitalsamba.com/blog/learning-management-systems)
- [360Learning - LMS Examples](https://360learning.com/blog/learning-management-system-examples/)

**Dashboard & Progress Tracking:**
- [iSpring - LMS Dashboard Guide](https://www.ispringsolutions.com/blog/lms-dashboard)
- [CYPHER Learning - Customizable Dashboards](https://www.cypherlearning.com/blog/business/which-lms-offers-a-customizable-learner-dashboard-and-progress-tracking)
- [Educate-Me - LMS Reports 2026](https://www.educate-me.co/blog/lms-reporting)

**Video Platforms:**
- [Uscreen - Video Course Platforms 2026](https://www.uscreen.tv/blog/video-course-platforms/)
- [ThimPress - Video Hosting for Courses](https://thimpress.com/best-video-hosting-platforms-for-online-courses/)

**Anti-Patterns & Mistakes:**
- [LMS Portals - eLearning Mistakes](https://www.lmsportals.com/post/ten-common-mistakes-to-avoid-in-elearning-course-design)
- [eLearning Industry - Platform Design Mistakes](https://elearningindustry.com/top-mistakes-when-designing-an-elearning-platform-and-how-to-avoid-them)
- [Airmeet - L&D Mistakes 2026](https://www.airmeet.com/hub/blog/learning-and-development-mistakes-to-avoid-in-2026-dos-donts-checklist/)

**Platform Comparisons:**
- [Uscreen - Thinkific vs Teachable](https://www.uscreen.tv/blog/thinkific-vs-teachable/)
- [Capterra - Hotmart](https://www.capterra.com/p/219169/Hotmart/)
- [GlobalNewswire - Brazil eLearning Market](https://www.globenewswire.com/news-release/2024/05/21/2885766/0/en/Brazil-eLearning-Focused-Insights-Report-2024-2029-Market-to-Reach-4-27-Billion-with-Anthology-Blackboard-Cogna-Educacao-Hotmart-Pearson-and-Telefonica-Dominating.html)

**Engagement & Differentiators:**
- [CYPHER Learning - Learning Platforms 2026](https://www.cypherlearning.com/blog/business/learning-platforms-to-watch-in-2026)
- [iSpring - Learning Experience Platforms](https://www.ispringsolutions.com/blog/learning-experience-platforms)
- [Disco - Personalized Learning 2026](https://www.disco.co/blog/ai-powered-personalized-learning-platform)

---

## Confidence Assessment

| Category | Confidence | Rationale |
|----------|------------|-----------|
| Table Stakes | HIGH | Multiple sources agree; standard across all major platforms |
| Differentiators | HIGH | Clear patterns from platform comparisons |
| Anti-Features | HIGH | Multiple sources cite same mistakes; validated by industry experience |
| Dependencies | HIGH | Technical dependencies are well-understood |
| MVP Recommendation | HIGH | Aligned with PROJECT.md constraints |
