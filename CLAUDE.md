@AGENTS.md

# Moso Tea — Claude Code Context

## Project Overview

Moso Tea is a New Zealand-based artisan tea experience studio operating as a home workshop.
The business offers immersive, hands-on tea culture experiences including guided tea ceremony
sessions, tea tree exploration, and tea tasting for individuals, couples, and small groups.

This website serves as the primary online presence for the business, enabling customers to
learn about the experiences offered and submit booking requests online.

- **Domain:** mosotea.co.nz
- **Repository:** github.com/LIUQI1010/mosotea-web-
- **Deployment:** Vercel (auto-deploy on push to main)
- **Database:** Supabase

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 16.2.1 (App Router) | Use App Router only, never Pages Router |
| Language | TypeScript | Strict mode, no `any` |
| Styling | Tailwind CSS | Utility classes only, no custom CSS files |
| Database | Supabase (PostgreSQL) | Use `@supabase/ssr` for server components |
| Auth | Supabase Auth | Admin dashboard only |
| Email | Resend | Booking confirmations and notifications |
| Deployment | Vercel | Auto-deploys from main branch |
| Domain & CDN | Cloudflare | DNS management |
| Package Manager | npm | Do not use yarn or pnpm |

---

## Project Structure

```
mosotea-web-/
├── src/
│   ├── app/
│   │   ├── (public)/               ← Public-facing pages (grouped route)
│   │   │   ├── page.tsx            ← Home page
│   │   │   ├── about/
│   │   │   │   └── page.tsx        ← About Us
│   │   │   ├── experiences/
│   │   │   │   └── page.tsx        ← Tea experiences listing
│   │   │   ├── booking/
│   │   │   │   └── page.tsx        ← Booking form
│   │   │   ├── contact/
│   │   │   │   └── page.tsx        ← Contact page
│   │   │   └── cancel/
│   │   │       └── [token]/
│   │   │           └── page.tsx    ← Customer self-cancellation page
│   │   ├── admin/                  ← Protected admin dashboard
│   │   │   ├── page.tsx            ← Booking list
│   │   │   ├── bookings/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    ← Booking detail
│   │   │   └── slots/
│   │   │       └── page.tsx        ← Time slot management
│   │   ├── api/                    ← API Routes (server-side only)
│   │   │   ├── booking/
│   │   │   │   └── route.ts        ← POST: submit booking
│   │   │   ├── cancel/
│   │   │   │   └── route.ts        ← POST: cancel booking via token
│   │   │   ├── contact/
│   │   │   │   └── route.ts        ← POST: contact form submission
│   │   │   └── admin/
│   │   │       ├── bookings/
│   │   │       │   └── route.ts    ← GET: list bookings, PATCH: confirm/cancel
│   │   │       └── slots/
│   │   │           └── route.ts    ← GET/POST/DELETE: manage time slots
│   │   ├── layout.tsx              ← Root layout
│   │   └── globals.css             ← Global styles (minimal)
│   ├── components/
│   │   ├── ui/                     ← Base UI components (Button, Input, etc.)
│   │   └── layout/                 ← Layout components (Navbar, Footer)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           ← Browser Supabase client
│   │   │   ├── server.ts           ← Server Supabase client
│   │   │   └── middleware.ts       ← Auth middleware helper
│   │   ├── resend/
│   │   │   └── emails.ts           ← Email sending functions
│   │   └── utils.ts                ← General utility functions
│   ├── types/
│   │   └── index.ts                ← Shared TypeScript types and interfaces
│   └── i18n/
│       ├── en.json                 ← English translations
│       └── zh-TW.json             ← Traditional Chinese translations
├── public/                         ← Static assets (images, icons, fonts)
├── .env.local                      ← Local environment variables (never commit)
├── .env.example                    ← Environment variable template (commit this)
├── CLAUDE.md                       ← This file
├── SPRINT.md                       ← Agile sprint plan
└── README.md                       ← Project setup instructions
```

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anon/public key (safe for client)
SUPABASE_SERVICE_ROLE_KEY=        # Supabase service role key (server only, never expose)

# Resend
RESEND_API_KEY=                   # Resend API key for sending emails

# App
NEXT_PUBLIC_APP_URL=              # e.g. http://localhost:3000 or https://mosotea.co.nz

# Security
CANCELLATION_TOKEN_SECRET=        # Random 32-byte hex string for signing cancel tokens
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` and `CANCELLATION_TOKEN_SECRET` must NEVER be used
> in client components or exposed to the browser. Only use in API Routes and Server Components.

---

## Database Schema

### Table: `services`
Stores the types of tea experiences offered.

```sql
create table services (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_zh text not null,
  description_en text,
  description_zh text,
  duration_minutes int not null,
  max_guests int not null,
  price_nzd decimal(10,2) not null,
  is_active boolean default true,
  created_at timestamptz default now()
);
```

### Table: `time_slots`
Stores available booking time slots managed by the admin.

```sql
create table time_slots (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references services(id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_available boolean default true,
  created_at timestamptz default now()
);
```

### Table: `bookings`
Stores all customer booking requests.

```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references services(id),
  time_slot_id uuid references time_slots(id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  guest_count int not null,
  special_requests text,
  preferred_language text default 'en',
  status text default 'pending',  -- pending | confirmed | cancelled
  cancellation_token text unique,
  cancellation_token_expires_at timestamptz,
  cancelled_by text,              -- 'customer' | 'admin'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

## Key Business Rules

### Booking Rules
- A time slot can only be booked once (enforce with unique constraint or check)
- After booking submission, status is `pending` until admin confirms
- Customer receives confirmation email immediately after submission
- Admin receives notification email immediately after submission

### Cancellation Rules
- Customers can self-cancel via a unique token link in their confirmation email
- Self-cancellation is only allowed **more than 24 hours** before the booking start time
- If within 24 hours, show an error and direct the customer to contact the business
- Cancellation tokens expire after the booking start time has passed
- Each token is single-use only
- When cancelled, the time slot is released (set `is_available = true`)
- Both customer and admin receive cancellation notification emails

### Admin Rules
- Admin dashboard is only accessible to authenticated users (Supabase Auth)
- Unauthenticated users are redirected to `/admin/login`
- Admin can confirm, cancel, and view all bookings
- Admin can add, remove, and toggle availability of time slots

---

## Email Templates

All emails must be sent in the customer's preferred language (English or Traditional Chinese).

| Email | Recipient | Trigger |
|---|---|---|
| Booking Confirmation | Customer | On booking submission |
| Booking Notification | Admin/Owner | On booking submission |
| Booking Confirmed | Customer | When admin confirms |
| Booking Cancelled by Admin | Customer | When admin cancels |
| Booking Cancelled by Customer | Customer | When customer self-cancels |
| Cancellation Notice | Admin/Owner | When customer self-cancels |

---

## Bilingual (i18n) Requirements

- Default language: **English**
- Secondary language: **Traditional Chinese (zh-TW)**
- Language toggle is visible in the navigation bar on all public pages
- URL parameter: `?lang=zh-TW`
- All public page content, form labels, error messages, and emails must be translated
- Admin dashboard is **English only**
- Use `next-intl` for internationalisation

---

## Code Style & Conventions

### General
- TypeScript strict mode — no `any`, no `@ts-ignore`
- All components must have explicit prop types
- Use named exports for components, default exports for pages
- Keep components under 150 lines — extract sub-components if needed

### File Naming
- Components: `PascalCase.tsx` (e.g. `BookingForm.tsx`)
- Utilities: `camelCase.ts` (e.g. `formatDate.ts`)
- Pages: `page.tsx` (Next.js convention)
- API Routes: `route.ts` (Next.js convention)

### Imports
- Always use `@/` alias for internal imports
- Group imports: React → Next.js → Third-party → Internal
- Example:
```typescript
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { BookingForm } from '@/components/ui/BookingForm'
import { createClient } from '@/lib/supabase/client'
```

### Tailwind
- Use Tailwind utility classes only — no custom CSS unless absolutely necessary
- Use `cn()` utility for conditional class merging (install `clsx` + `tailwind-merge`)
- Mobile-first responsive design: `sm:` `md:` `lg:` breakpoints

### API Routes
- Always validate request body with `zod`
- Return consistent response shape:
```typescript
// Success
return Response.json({ success: true, data: { ... } })

// Error
return Response.json({ success: false, error: 'Error message' }, { status: 400 })
```

### Supabase
- Use `createServerClient` from `@supabase/ssr` in Server Components and API Routes
- Use `createBrowserClient` from `@supabase/ssr` in Client Components
- Never use `SUPABASE_SERVICE_ROLE_KEY` in client components

---

## Commands

```bash
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Build for production
npm run start      # Start production server locally
npm run lint       # Run ESLint
npm run type-check # Run TypeScript type checking (tsc --noEmit)
```

---

## Git Workflow

```
main          ← Production (auto-deploys to Vercel, protected branch)
  └── develop ← Development branch
        ├── feature/xxx  ← New features
        └── fix/xxx      ← Bug fixes
```

### Commit Message Format
```
feat: add booking form time slot picker
fix: resolve double-booking race condition
chore: update dependencies
docs: update README setup instructions
style: improve mobile navbar layout
refactor: extract email templates to separate file
test: add booking API route tests
```

### PR Rules
- All PRs must target `develop`, not `main`
- At least 1 approval required before merging
- PR title must follow commit message format
- `develop` is merged into `main` at the end of each Sprint

---

## Design Guidelines

- **Style:** Minimal, natural, East Asian-inspired aesthetic
- **Colours:** Warm earth tones — tea brown, cream, bamboo green, off-white
- **Typography:** Clean elegant sans-serif for body, serif for headings
- **Imagery:** High-quality photography of tea, hands, nature, the studio
- **Whitespace:** Generous — avoid cluttered layouts
- **Mobile-first:** Design for 375px width first, then scale up

---

## Sprint Reference

See `SPRINT.md` for the full Agile sprint plan.

Current phase: **Sprint 0 — Project Setup**

| Sprint | Focus |
|---|---|
| Pre-Sprint | PRD, requirements, client sign-off ✅ |
| Sprint 0 | Project setup, Figma wireframes |
| Sprint 1 | Core information pages + i18n |
| Sprint 2 | Booking system + cancellation emails |
| Sprint 3 | Admin dashboard + self-cancellation |
| Sprint 4 | Testing, performance, launch |
