# Moso Tea — Agile Sprint Plan

> **Project:** Moso Tea Website (mosotea.co.nz)
> **Team:** 2 Developers (Full-Time, ~40hrs/week each)
> **Methodology:** Agile — 1-Week Sprints
> **Total Duration:** Pre-Sprint + 5 Sprints (~6 Weeks)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) with TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (admin only) |
| Email | Resend |
| Deployment | Vercel |
| Domain & CDN | Cloudflare (mosotea.co.nz) |

---

## GitHub Workflow

### Branch Strategy

```
main          ← Production branch (auto-deploy to Vercel)
  └── develop ← Main development branch
        ├── feature/xxx ← Individual feature branches
        └── fix/xxx     ← Bug fix branches
```

### Pull Request Process

1. Branch off `develop` for every feature or fix
2. Open a PR to `develop` when complete
3. Peer code review required before merging
4. At end of each Sprint, `develop` is merged into `main`

### Commit Message Convention

```
feat: add booking form validation
fix: resolve time slot conflict bug
docs: update README with setup instructions
style: adjust mobile layout for booking page
chore: update dependencies
```

---

## Agile Ceremonies

| Ceremony | When | Duration | Purpose |
|---|---|---|---|
| Sprint Planning | Start of Sprint | 1 hour | Define sprint goals and assign tasks |
| Daily Standup | Every day | 10 mins | Sync progress and surface blockers |
| Sprint Review | End of Sprint | 30 mins | Demo completed work |
| Retrospective | End of Sprint | 30 mins | Identify improvements for next sprint |

### Daily Standup Template

Each developer answers:
- What did I complete yesterday?
- What will I work on today?
- Are there any blockers?

---

## Pre-Sprint — Discovery Phase

> **Goal:** Complete requirements gathering and client sign-off before any development begins.

| Task | Owner | Output |
|---|---|---|
| Interview client to gather requirements | Both | Raw notes |
| Write Product Requirements Document (PRD) | Developer 1 | PRD document |
| Client review and sign-off on PRD | Both | Signed PRD |
| Identify brand assets (logo, colours, fonts) | Developer 2 | Brand guidelines |
| Agree on tech stack and architecture | Both | Architecture doc |

**Definition of Done:**
- [x] Client has reviewed and signed the PRD
- [x] Architecture documented in repo

---

## Sprint 0 — Project Setup

> **Goal:** All infrastructure in place. Team can start writing business code from Day 1.

| Task | Owner |
|---|---|
| Create GitHub repository and configure branch protection rules | Developer 1 |
| Initialise Next.js project with TypeScript, Tailwind, ESLint | Developer 1 |
| Configure Prettier and Husky pre-commit hooks | Developer 1 |
| Set up GitHub Projects board and Issues templates | Developer 2 |
| Create Supabase project and design database schema | Developer 1 |
| Set up Vercel project and connect to GitHub for auto-deploy | Developer 1 |
| Configure environment variables (.env.local) | Developer 1 |
| Create Figma project and produce wireframes for all pages | Developer 2 |
| Define brand colours, typography and design system | Developer 2 |
| Present wireframes to client for approval | Both |

**Definition of Done:**
- [x] Push to `main` triggers successful Vercel deployment
- [x] Client has approved wireframes and design system
- [x] README documents local setup steps

---

## Sprint 1 — Core Pages

> **Goal:** All information display pages fully developed, responsive, and reviewed.

| Task | Owner |
|---|---|
| Build global navigation bar component | Developer 2 |
| Build footer component | Developer 2 |
| Develop Home page | Developer 2 |
| Develop About Us page | Developer 2 |
| Develop Experiences page | Developer 2 |
| Develop Contact Us page with form UI | Developer 2 |
| Implement Contact form API Route | Developer 1 |
| Integrate Resend to send contact form emails | Developer 1 |
| Set up next-intl for string management (English only for public pages) | Developer 1 |
| Configure global SEO metadata for all pages | Developer 1 |
| Generate sitemap.xml and robots.txt | Developer 1 |
| Responsive testing on mobile, tablet, and desktop | Both |

**Definition of Done:**
- [x] All pages render correctly on mobile, tablet, and desktop
- [x] All public pages display in English with next-intl string management
- [x] Contact form successfully sends email via Resend
- [x] All pages have correct SEO metadata

---

## Sprint 2 — Booking System

> **Goal:** End-to-end booking flow works — customers can select a time slot, submit a booking, and receive a confirmation email with a cancellation link.

| Task | Owner | Status |
|---|---|---|
| Create database tables: `bookings`, `time_slots`, `gallery` | Developer 1 | ✅ Done |
| Write Supabase Row Level Security (RLS) policies | Developer 1 | ✅ Done |
| Develop Booking page UI layout (2-step flow, no experience selection) | Developer 2 | ✅ Done |
| Build time slot picker component (fetches from API by date) | Developer 2 | ✅ Done |
| Build booking form (name, email, phone, guests, requests, language) | Developer 2 | ✅ Done |
| Implement time slots query API Route (`GET /api/time-slots`) | Developer 1 | ✅ Done |
| Implement booking submission API Route (`POST /api/booking`) | Developer 1 | ✅ Done |
| Implement time slot capacity check (API + DB trigger) | Developer 1 | ✅ Done |
| Generate unique cancellation token per booking (HMAC-SHA256) | Developer 1 | ✅ Done |
| Implement cancellation API Route (`POST /api/cancel`) | Developer 1 | ✅ Done |
| Send confirmation email with cancellation link to customer | Developer 1 | ✅ Done |
| Send booking notification email to business owner | Developer 1 | ✅ Done |
| Develop booking success and error pages | Developer 2 | ✅ Done |
| End-to-end testing with real database | Both | ✅ Done |

**Definition of Done:**
- [x] Complete booking flow works end-to-end
- [x] Double-booking of the same time slot is prevented (DB trigger + API capacity check)
- [x] Customer receives confirmation email with a valid cancellation link
- [x] Business owner receives booking notification email

---

## Sprint 3 — Admin Dashboard & Customer Cancellation UI

> **Goal:** Business owner can manage bookings via a secure admin interface. Customers can self-cancel via the cancellation page.
>
> Note: Cancellation API (`POST /api/cancel`), token generation, 24-hour cutoff logic, and cancellation emails were completed in Sprint 2.

| Task | Owner | Status |
|---|---|---|
| Set up Supabase Auth for admin login | Developer 1 | ✅ Done |
| Build admin login page with protected route middleware | Developer 1 | ✅ Done |
| Develop booking list page (view all bookings) | Developer 2 | ✅ Done |
| Implement admin bookings API (`GET/PATCH /api/admin/bookings`) | Developer 1 | ✅ Done (via Server Actions) |
| Implement confirm booking action | Developer 1 | ✅ Done |
| Implement admin cancel booking action with email notification | Developer 1 | ✅ Done |
| Build time slot management page (add/remove/toggle slots) | Developer 1 | ✅ Done |
| Implement admin slots API (`GET/POST/DELETE /api/admin/slots`) | Developer 1 | ✅ Done (via Server Actions) |
| Implement "Generate Next 30 Days" bulk slot creation | Developer 1 | ✅ Done |
| Build customer self-cancellation page (`/cancel/[token]`) | Developer 1 | ✅ Done |
| Implement cancellation token lookup API (`GET /api/cancel/lookup`) | Developer 1 | ✅ Done |
| Responsive design for admin dashboard | Developer 2 | ✅ Done |
| Write admin user guide for client | Developer 2 | ⏳ Pending |
| Add Privacy Policy page | Developer 1 | ✅ Done |
| Add Terms of Service page | Developer 1 | ✅ Done |
| Fix time slot 2.5h cutoff filter | Developer 1 | ✅ Done |
| Add booking form validation (name, email, phone, guests, special requests) | Developer 1 | ✅ Done |
| Scroll to top after successful booking | Developer 1 | ✅ Done |
| Fix timezone double-conversion bug (nzNow hack) in slots/dashboard | Developer 1 | ✅ Done |
| Fix dashboard stats timezone queries (bare date → UTC range) | Developer 1 | ✅ Done |
| Optimize database queries (search filter, select columns, pagination) | Developer 1 | ✅ Done |
| Add admin loading state | Developer 1 | ✅ Done |
| Compress images (20MB → 2MB) | Developer 1 | ✅ Done |
| Add SVG favicon | Developer 1 | ✅ Done |
| Dashboard UI: integrate pending badge into stats card | Developer 1 | ✅ Done |
| Bookings calendar: align sidebar, increase text size, sort by status | Developer 1 | ✅ Done |

**Definition of Done:**
- [x] Admin login works and unauthenticated users are redirected
- [x] Owner can view, confirm, and cancel bookings
- [x] Owner can manage available time slots (add, remove, toggle, bulk generate)
- [x] Customer can self-cancel via email link (if more than 24 hours before booking)
- [x] Cancellation within 24 hours shows appropriate error message
- [x] All cancellation emails send correctly
- [x] Responsive design for admin dashboard
- [ ] Admin user guide for client

---

## Sprint 4 — Testing & Launch

> **Goal:** Website is stable, performant, and live on mosotea.co.nz. Client has accepted delivery.

| Task | Owner | Status |
|---|---|---|
| Performance optimisation (images, fonts, code splitting) | Developer 1 | ✅ Done (images compressed) |
| Error boundary and loading state review | Both | ✅ Done (admin loading.tsx added) |
| Connect mosotea.co.nz in Vercel and configure Cloudflare DNS | Developer 1 | ✅ Done |
| Configure production environment variables in Vercel | Developer 1 | ✅ Done |
| Run Lighthouse audits — target 90+ on all scores | Developer 1 | ✅ Done (97-98 across all pages) |
| Cross-browser testing: Chrome, Safari, Firefox | Developer 2 | ✅ Done |
| Full mobile device testing | Developer 2 | ✅ Done |
| End-to-end booking and cancellation flow regression test | Both | ✅ Done |
| Submit sitemap to Google Search Console | Developer 1 | ✅ Done |
| Set up Google Business Profile | Developer 2 | ✅ Done |
| Add bilingual support (EN/繁中) to admin dashboard (cookie-based) | Developer 1 | ✅ Done |
| Add input length limits to all forms (HTML maxLength + server-side Zod) | Developer 1 | ✅ Done |
| Client User Acceptance Testing (UAT) | Both | ⏳ Pending |
| Finalise README and project documentation | Both | ✅ Done |
| Deliver admin credentials and user guide to client | Developer 1 | ⏳ Pending |

**Definition of Done:**
- [x] Lighthouse scores 90+ for Performance, Accessibility, Best Practices, SEO
- [ ] Website live on mosotea.co.nz with valid HTTPS
- [ ] Full booking and cancellation flow tested and working in production
- [ ] Client has completed UAT and signed delivery acceptance
- [ ] GitHub README is complete with screenshots and setup instructions

---

## Sprint 5 — Announcements & Gallery

> **Goal:** Admin can publish announcements displayed on the homepage, and manage gallery images dynamically via Supabase Storage.

| Task | Owner | Status |
|---|---|---|
| **Announcements** | | |
| Create `announcements` table in Supabase (with RLS policies) | Developer 1 | ✅ Done |
| Add `Announcement` type to `src/types/index.ts` | Developer 1 | ✅ Done |
| Build admin announcements page (`/admin/announcements`) | Developer 1 | ✅ Done |
| Implement announcements server actions (CRUD + toggle active) | Developer 1 | ✅ Done |
| Add announcements sidebar nav item in `AdminSidebar.tsx` | Developer 1 | ✅ Done |
| Build homepage announcement banner component (rotating) | Developer 1 | ✅ Done |
| Add announcement-related translation keys to `en.json` / `zh-TW.json` | Developer 1 | ✅ Done |
| **Gallery** | | |
| Create Supabase Storage bucket `gallery` (public access, 2MB limit) | Developer 1 | ✅ Done |
| Build admin gallery page (`/admin/gallery`) with image upload/delete/caption | Developer 1 | ✅ Done |
| Implement gallery server actions (upload, updateCaption, delete) | Developer 1 | ✅ Done |
| Add gallery sidebar nav item in `AdminSidebar.tsx` | Developer 1 | ✅ Done |
| Build standalone Gallery page (`/gallery`) with masonry layout + lightbox | Developer 1 | ✅ Done |
| Build homepage Gallery preview section (6 images + "View All" link) | Developer 1 | ✅ Done |
| Add Gallery link to public navigation bar | Developer 1 | ✅ Done |
| Configure Supabase Storage domain in `next.config.ts` for `next/image` | Developer 1 | ✅ Done |
| Implement client-side image compression (Canvas API, ≤ 2MB) | Developer 1 | ✅ Done |
| Add gallery-related translation keys to `en.json` / `zh-TW.json` | Developer 1 | ✅ Done |
| **Gallery UX Optimisation** | | |
| Add skeleton loading screens for gallery page and homepage gallery section | Developer 1 | ✅ Done |
| Implement preload-all-then-fade-in loading strategy (avoids masonry reflow jitter) | Developer 1 | ✅ Done |
| Add accessibility attributes to gallery (aria-labels, dialog role, keyboard nav) | Developer 1 | ✅ Done |
| Move lightbox caption to gradient overlay on image | Developer 1 | ✅ Done |
| Add homepage gallery individual image fade-in with skeleton placeholders | Developer 1 | ✅ Done |
| Responsive testing for announcements banner and gallery section | Both | ⏳ Pending |

**Definition of Done:**
- [x] Admin can create, edit, toggle, and delete announcements
- [x] Homepage displays active announcements as a rotating top banner
- [x] Admin can upload, edit captions, and delete gallery images via Supabase Storage
- [x] Standalone Gallery page with masonry layout and lightbox
- [x] Homepage displays Gallery preview (6 images) with link to full gallery
- [x] Gallery loading UX: skeleton screens + preload-all fade-in (no layout jitter)
- [x] Gallery accessibility: aria-labels, dialog role, keyboard navigation
- [ ] All new UI is responsive on mobile, tablet, and desktop

---

## Sprint 6 — Email Template Management

> **Goal:** Admin can customize the content of customer-facing booking emails via the admin dashboard, with placeholder variables and live preview.

| Task | Owner | Status |
|---|---|---|
| Create `email_templates` table in Supabase (with RLS policies) | Developer 1 | ⏳ Pending |
| Add `EmailTemplate` type to `src/types/index.ts` | Developer 1 | ⏳ Pending |
| Build admin email templates page (`/admin/email-templates`) | Developer 1 | ⏳ Pending |
| Implement email template server actions (get, upsert, delete) | Developer 1 | ⏳ Pending |
| Add email templates sidebar nav item in `AdminSidebar.tsx` | Developer 1 | ⏳ Pending |
| Build template editor with placeholder variable insertion | Developer 1 | ⏳ Pending |
| Build email preview with sample data | Developer 1 | ⏳ Pending |
| Integrate template loading into `emails.ts` send functions | Developer 1 | ⏳ Pending |
| Implement placeholder variable replacement at send time | Developer 1 | ⏳ Pending |
| Implement "Reset to Default" functionality | Developer 1 | ⏳ Pending |
| Add email template translation keys to `en.json` / `zh-TW.json` | Developer 1 | ⏳ Pending |
| End-to-end testing: edit template → send booking → verify email content | Both | ⏳ Pending |

**Definition of Done:**
- [ ] Admin can edit subject and body for 3 customer-facing email types (booking_received, booking_confirmed, cancellation_confirmation)
- [ ] Templates support bilingual content (EN / zh-TW) for email language preference
- [ ] Placeholder variables (customer_name, date_time, guest_count, total_price, cancellation_url) are correctly replaced at send time
- [ ] Admin can preview email with sample data before saving
- [ ] Admin can reset template to default by deleting the custom record
- [ ] Fallback to hardcoded default when no custom template exists
- [ ] Email template page is accessible from admin sidebar

---

## Sprint Summary

| Phase | Duration | Key Deliverable |
|---|---|---|
| Pre-Sprint | ~3 days | Signed PRD, architecture document |
| Sprint 0 | 1 week | Project scaffolding, approved wireframes |
| Sprint 1 | 1 week | All information pages live |
| Sprint 2 | 1 week | Full booking system with cancellation link |
| Sprint 3 | 1 week | Admin dashboard + customer self-cancellation + bug fixes |
| Sprint 4 | 1 week | Testing, performance, launch |
| Sprint 5 | 1 week | Announcements + Gallery management |
| Sprint 6 | 1 week | Email template management |

---

## Portfolio & CV Notes

This project demonstrates the following professional skills:

| Skill | Evidence |
|---|---|
| Full-Stack Development | Next.js, Supabase, API design, authentication |
| Agile Project Management | 5-sprint delivery, ceremonies, GitHub Projects board |
| Team Collaboration | Pair development, PR reviews, defined code standards |
| DevOps & Deployment | Vercel CI/CD, Cloudflare DNS, environment management |
| SEO & Performance | Lighthouse 90+, sitemap, Google Search Console |
| Internationalisation (i18n) | Admin dashboard bilingual support (EN/繁中) |
| Client Communication | PRD sign-off, UAT, user guide delivery |

**Recommended CV entry:**

> Full-Stack Web Developer — Moso Tea (mosotea.co.nz)
> - Delivered a full commercial website for a New Zealand tea experience studio in a 2-person Agile team
> - Built with Next.js, TypeScript, Tailwind CSS, Supabase, and Resend
> - Features include: dual workshop booking system with self-cancellation, admin dashboard (bilingual EN/繁中), and automated email notifications
> - Achieved Lighthouse performance score of 90+ across all categories
> - Managed full project lifecycle from PRD to client sign-off using GitHub Projects and weekly sprints
