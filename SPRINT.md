# Moso Tea — Agile Sprint Plan

> **Project:** Moso Tea Website (mosotea.co.nz)
> **Team:** 2 Developers (Full-Time, ~40hrs/week each)
> **Methodology:** Agile — 1-Week Sprints
> **Total Duration:** Pre-Sprint + 5 Sprints (~6 Weeks)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) with TypeScript |
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
- [ ] Client has approved wireframes and design system
- [ ] README documents local setup steps

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
| Implement bilingual support (English / Traditional Chinese) | Developer 1 |
| Configure global SEO metadata for all pages | Developer 1 |
| Generate sitemap.xml and robots.txt | Developer 1 |
| Responsive testing on mobile, tablet, and desktop | Both |

**Definition of Done:**
- [ ] All pages render correctly on mobile, tablet, and desktop
- [ ] Language toggle switches all content between English and Traditional Chinese
- [ ] Contact form successfully sends email via Resend
- [ ] All pages have correct SEO metadata

---

## Sprint 2 — Booking System

> **Goal:** End-to-end booking flow works — customers can select a time slot, submit a booking, and receive a confirmation email with a cancellation link.

| Task | Owner |
|---|---|
| Create database tables: `bookings`, `services`, `time_slots` | Developer 1 |
| Write Supabase Row Level Security (RLS) policies | Developer 1 |
| Develop Booking page UI layout | Developer 2 |
| Build service selection component | Developer 2 |
| Build time slot picker component (available slots only) | Developer 2 |
| Build booking form (name, email, phone, guests, requests) | Developer 2 |
| Implement booking submission API Route | Developer 1 |
| Implement time slot conflict detection logic | Developer 1 |
| Generate unique cancellation token per booking | Developer 1 |
| Send confirmation email with cancellation link to customer | Developer 1 |
| Send booking notification email to business owner | Developer 1 |
| Develop booking success and error pages | Developer 2 |

**Definition of Done:**
- [ ] Complete booking flow works end-to-end
- [ ] Double-booking of the same time slot is prevented
- [ ] Customer receives confirmation email with a valid cancellation link
- [ ] Business owner receives booking notification email

---

## Sprint 3 — Admin Dashboard & Customer Cancellation

> **Goal:** Business owner can manage bookings via a secure admin interface. Customers can self-cancel via email link.

| Task | Owner |
|---|---|
| Set up Supabase Auth for admin login | Developer 1 |
| Build admin login page with protected route middleware | Developer 1 |
| Develop booking list page (view all bookings) | Developer 2 |
| Develop booking detail view | Developer 2 |
| Implement confirm booking action | Developer 1 |
| Implement admin cancel booking action with email notification | Developer 1 |
| Build time slot management page (add/remove available slots) | Developer 1 |
| Build customer self-cancellation page (validate token) | Developer 1 |
| Implement cancellation deadline logic (24-hour cutoff) | Developer 1 |
| Send cancellation confirmation email to customer | Developer 1 |
| Send cancellation notice email to business owner | Developer 1 |
| Responsive design for admin dashboard | Developer 2 |
| Write admin user guide for client | Developer 2 |

**Definition of Done:**
- [ ] Admin login works and unauthenticated users are redirected
- [ ] Owner can view, confirm, and cancel bookings
- [ ] Owner can manage available time slots
- [ ] Customer can self-cancel via email link (if more than 24 hours before booking)
- [ ] Cancellation within 24 hours shows appropriate error message
- [ ] All cancellation emails send correctly

---

## Sprint 4 — Testing & Launch

> **Goal:** Website is stable, performant, and live on mosotea.co.nz. Client has accepted delivery.

| Task | Owner |
|---|---|
| Run Lighthouse audits — target 90+ on all scores | Developer 1 |
| Performance optimisation (images, fonts, code splitting) | Developer 1 |
| Cross-browser testing: Chrome, Safari, Firefox | Developer 2 |
| Full mobile device testing | Developer 2 |
| End-to-end booking and cancellation flow regression test | Both |
| Error boundary and loading state review | Both |
| Connect mosotea.co.nz in Vercel and configure Cloudflare DNS | Developer 1 |
| Configure production environment variables in Vercel | Developer 1 |
| Submit sitemap to Google Search Console | Developer 1 |
| Set up Google Business Profile | Developer 2 |
| Client User Acceptance Testing (UAT) | Both |
| Finalise README and project documentation | Both |
| Deliver admin credentials and user guide to client | Developer 1 |

**Definition of Done:**
- [ ] Lighthouse scores 90+ for Performance, Accessibility, Best Practices, SEO
- [ ] Website live on mosotea.co.nz with valid HTTPS
- [ ] Full booking and cancellation flow tested and working in production
- [ ] Client has completed UAT and signed delivery acceptance
- [ ] GitHub README is complete with screenshots and setup instructions

---

## Sprint Summary

| Phase | Duration | Key Deliverable |
|---|---|---|
| Pre-Sprint | ~3 days | Signed PRD, architecture document |
| Sprint 0 | 1 week | Project scaffolding, approved wireframes |
| Sprint 1 | 1 week | All information pages live, bilingual support |
| Sprint 2 | 1 week | Full booking system with cancellation link |
| Sprint 3 | 1 week | Admin dashboard + customer self-cancellation |
| Sprint 4 | 1 week | Tested, launched, client accepted |

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
| Internationalisation (i18n) | English + Traditional Chinese bilingual support |
| Client Communication | PRD sign-off, UAT, user guide delivery |

**Recommended CV entry:**

> Full-Stack Web Developer — Moso Tea (mosotea.co.nz)
> - Delivered a full commercial website for a New Zealand tea experience studio in a 2-person Agile team
> - Built with Next.js, TypeScript, Tailwind CSS, Supabase, and Resend
> - Features include: booking system with self-cancellation, admin dashboard, bilingual support (EN/繁中), and automated email notifications
> - Achieved Lighthouse performance score of 90+ across all categories
> - Managed full project lifecycle from PRD to client sign-off using GitHub Projects and weekly sprints
