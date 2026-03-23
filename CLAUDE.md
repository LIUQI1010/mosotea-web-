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
| Styling | Tailwind CSS v4 | Uses CSS variables in globals.css, no tailwind.config.ts |
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
│   │   ├── (public)/               ← Public-facing pages (grouped route, no URL prefix)
│   │   │   ├── page.tsx            ← Home page (/)
│   │   │   ├── about/
│   │   │   │   └── page.tsx        ← About Us (/about)
│   │   │   ├── experiences/
│   │   │   │   └── page.tsx        ← Tea experiences (/experiences)
│   │   │   ├── book/
│   │   │   │   └── page.tsx        ← Booking form (/book)
│   │   │   ├── contact/
│   │   │   │   └── page.tsx        ← Contact page (/contact)
│   │   │   └── cancel/
│   │   │       └── [token]/
│   │   │           └── page.tsx    ← Customer self-cancellation (/cancel/[token])
│   │   ├── admin/                  ← Protected admin dashboard
│   │   │   ├── page.tsx            ← Booking list (/admin)
│   │   │   ├── login/
│   │   │   │   └── page.tsx        ← Admin login (/admin/login)
│   │   │   ├── bookings/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    ← Booking detail (/admin/bookings/[id])
│   │   │   └── slots/
│   │   │       └── page.tsx        ← Time slot management (/admin/slots)
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
│   │   ├── globals.css             ← Tailwind v4 config + Moso Tea color palette
│   │   └── layout.tsx              ← Root layout (fonts, metadata)
│   ├── components/
│   │   └── layout/
│   │       ├── Navigation.tsx      ← Global navigation bar
│   │       └── Footer.tsx          ← Global footer
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           ← Browser Supabase client (use in Client Components)
│   │   │   └── server.ts           ← Server Supabase client (use in Server Components + API Routes)
│   │   └── resend/
│   │       └── emails.ts           ← All email sending functions
│   ├── types/
│   │   └── index.ts                ← Shared TypeScript types and interfaces
│   └── i18n/                       ← Translation files (to be created)
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

## Color Palette (Tailwind v4 — defined in globals.css)

| Variable | Hex | Usage |
|---|---|---|
| `--tea-brown` / `tea-brown` | `#7C5C3E` | Primary brand color, buttons, headings |
| `--cream` / `cream` | `#FDF6F0` | Section backgrounds |
| `--bamboo-green` / `bamboo-green` | `#5C7A5C` | Secondary text, Chinese subtitles |
| `--off-white` / `off-white` | `#FAFAF8` | Page background |
| `--foreground` | `#3D3D3D` | Body text |
| `--muted-foreground` | `#6B6B6B` | Secondary text |
| `--border` | `#E8E0D8` | Borders and dividers |

---

## Typography (defined in globals.css + layout.tsx)

| Variable | Font | Usage |
|---|---|---|
| `font-serif` | Cormorant Garamond | Headings, titles, Chinese text |
| `font-sans` | Inter | Body text, UI elements |

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
```sql
create table time_slots (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references services(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  max_guests int not null default 8,
  booked_guests int not null default 0,
  is_available boolean default true,
  created_at timestamptz default now()
);
```

### Table: `bookings`
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
  status text default 'pending',
  cancellation_token text unique,
  cancellation_token_expires_at timestamptz,
  cancelled_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Database Triggers

| Trigger | Table | When | Action |
|---|---|---|---|
| `bookings_updated_at` | bookings | Before update | Auto-update `updated_at` |
| `bookings_check_guests` | bookings | Before insert | Check capacity, update `booked_guests` |
| `bookings_release_guests` | bookings | After update | Release `booked_guests` on cancellation |

---

## Key Business Rules

### Booking Rules
- A time slot supports up to **8 guests total** across multiple bookings
- `booked_guests` is automatically updated via database trigger on insert
- After submission, status is `pending` until admin confirms
- Customer receives confirmation email immediately after submission
- Admin receives notification email immediately after submission

### Cancellation Rules
- Customers self-cancel via a unique token link in their confirmation email
- Self-cancellation only allowed **more than 24 hours** before booking start time
- If within 24 hours, show error and direct customer to contact business directly
- Cancellation tokens expire after the booking start time has passed
- Each token is single-use only
- When cancelled, `booked_guests` is released via database trigger
- Both customer and admin receive cancellation notification emails

### Admin Rules
- Admin dashboard only accessible to authenticated users (Supabase Auth)
- Unauthenticated users redirected to `/admin/login`
- Admin can confirm, cancel, and view all bookings
- Admin can add, remove, and toggle availability of time slots

---

## Email Functions (src/lib/resend/emails.ts)

| Function | Recipient | Trigger |
|---|---|---|
| `sendBookingConfirmation` | Customer | On booking submission — includes cancellation link |
| `sendBookingNotification` | Admin/Owner | On booking submission |
| `sendCancellationConfirmation` | Customer | When customer self-cancels |
| `sendCancellationNotice` | Admin/Owner | When customer self-cancels |

All emails respect `preferred_language` — English or Traditional Chinese (zh-TW).

---

## Supabase Client Usage

```typescript
// In Client Components ("use client")
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// In Server Components and API Routes
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
```

---

## Bilingual (i18n) Requirements

- Default language: **English**
- Secondary language: **Traditional Chinese (zh-TW)**
- Library: **next-intl** (v4)
- Language toggle in navigation bar on all public pages
- URL-based locale routing: `/about` (English default), `/zh-TW/about` (Chinese)
- Locale prefix mode: `as-needed` (English has no prefix, zh-TW has prefix)
- **All new public pages must support bilingual switching:**
  1. Place pages under `src/app/[locale]/(public)/`
  2. Use `useTranslations` (client) or `getTranslations` (server) from `next-intl`
  3. Use `Link` from `@/i18n/navigation` instead of `next/link`
  4. Add all user-facing strings to `messages/en.json` and `messages/zh-TW.json`
  5. Follow the bilingual display pattern: main title in current locale, subtitle in the other language
- All public page content, form labels, error messages, and emails must be translated
- Admin dashboard is **English only** (no locale segment needed)
- Translation files: `messages/en.json` and `messages/zh-TW.json`
- i18n config: `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/i18n/navigation.ts`

---

## Code Style & Conventions

### General
- TypeScript strict mode — no `any`, no `@ts-ignore`
- All components must have explicit prop types
- Named exports for components, default exports for pages
- Keep components under 150 lines — extract sub-components if needed

### File Naming
- Components: `PascalCase.tsx` (e.g. `BookingForm.tsx`)
- Utilities: `camelCase.ts` (e.g. `formatDate.ts`)
- Pages: `page.tsx` (Next.js convention)
- API Routes: `route.ts` (Next.js convention)

### Imports
- Always use `@/` alias for internal imports
- Group imports: React → Next.js → Third-party → Internal

```typescript
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Navigation } from '@/components/layout/Navigation'
import { createClient } from '@/lib/supabase/client'
import type { Booking } from '@/types'
```

### Tailwind
- Use Tailwind utility classes only — no custom CSS unless absolutely necessary
- Mobile-first responsive design: `sm:` `md:` `lg:` breakpoints
- Custom colors available: `tea-brown`, `cream`, `bamboo-green`, `off-white`

### API Routes
- Always validate request body with `zod`
- Return consistent response shape:

```typescript
// Success
return Response.json({ success: true, data: { ... } })

// Error
return Response.json({ success: false, error: 'Error message' }, { status: 400 })
```

---

## Commands

```bash
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Build for production
npm run start      # Start production server locally
npm run lint       # Run ESLint
```

---

## Git Workflow

```
main          ← Production (auto-deploys to Vercel, protected branch)
  └── develop ← Development branch (default branch)
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
```

### PR Rules
- All PRs must target `develop`, not `main`
- At least 1 approval required before merging
- `develop` is merged into `main` at the end of each Sprint

---

## Design Guidelines

- **Style:** Minimal, natural, East Asian-inspired aesthetic
- **Colours:** Warm earth tones — tea brown, cream, bamboo green, off-white
- **Typography:** Cormorant Garamond (serif) for headings, Inter (sans) for body
- **Imagery:** High-quality photography of tea, hands, nature, the studio
- **Whitespace:** Generous — avoid cluttered layouts
- **Mobile-first:** Design for 375px width first, then scale up

---

## Sprint Reference

See `SPRINT.md` for the full Agile sprint plan.

| Sprint | Focus | Status |
|---|---|---|
| Pre-Sprint | PRD, requirements, client sign-off | ✅ Done |
| Sprint 0 | Project setup, DB schema, Figma wireframes | 🔄 In Progress |
| Sprint 1 | Core information pages + i18n | ⏳ Up Next |
| Sprint 2 | Booking system + cancellation emails | ⏳ Pending |
| Sprint 3 | Admin dashboard + self-cancellation | ⏳ Pending |
| Sprint 4 | Testing, performance, launch | ⏳ Pending |