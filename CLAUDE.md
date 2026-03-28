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
│   │   ├── [locale]/(public)/      ← Public pages with i18n locale routing
│   │   │   ├── page.tsx            ← Home page (/)
│   │   │   ├── about/
│   │   │   │   └── page.tsx        ← About Us (/about)
│   │   │   ├── workshop/
│   │   │   │   └── page.tsx        ← Workshop details (/workshop)
│   │   │   ├── book/
│   │   │   │   └── page.tsx        ← Booking form (/book)
│   │   │   ├── contact/
│   │   │   │   └── page.tsx        ← Contact page (/contact)
│   │   │   ├── privacy/
│   │   │   │   ├── layout.tsx      ← Privacy Policy metadata
│   │   │   │   └── page.tsx        ← Privacy Policy (/privacy)
│   │   │   ├── terms/
│   │   │   │   ├── layout.tsx      ← Terms of Service metadata
│   │   │   │   └── page.tsx        ← Terms of Service (/terms)
│   │   │   └── cancel/
│   │   │       └── [token]/
│   │   │           └── page.tsx    ← Customer self-cancellation (/cancel/[token])
│   │   ├── [locale]/
│   │   │   └── not-found.tsx       ← 404 Not Found page
│   │   ├── admin/                  ← Protected admin dashboard (bilingual via cookie, no locale segment)
│   │   │   ├── _actions/
│   │   │   │   ├── auth.ts         ← Server actions: login/logout
│   │   │   │   └── locale.ts       ← Server actions: get/set admin locale (cookie-based)
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx      ← Dashboard layout with sidebar
│   │   │   │   ├── loading.tsx     ← Shared loading state for all admin pages
│   │   │   │   ├── page.tsx        ← Dashboard data fetching (server component)
│   │   │   │   ├── DashboardClient.tsx ← Dashboard UI with translations (client component)
│   │   │   │   ├── AdminSidebar.tsx ← Sidebar navigation + language switcher
│   │   │   │   ├── bookings/
│   │   │   │   │   ├── page.tsx    ← Booking list with calendar view (/admin/bookings)
│   │   │   │   │   └── _actions.ts ← Server actions: confirm, cancel, create, update bookings
│   │   │   │   ├── slots/
│   │   │   │   │   ├── page.tsx    ← Time slot management (/admin/slots)
│   │   │   │   │   └── _actions.ts ← Server actions: generate slots, toggle availability
│   │   │   │   ├── announcements/
│   │   │   │   │   ├── page.tsx    ← Announcement management (/admin/announcements)
│   │   │   │   │   └── _actions.ts ← Server actions: CRUD announcements, toggle active
│   │   │   │   └── gallery/
│   │   │   │       ├── page.tsx    ← Gallery image management (/admin/gallery)
│   │   │   │       └── _actions.ts ← Server actions: upload/delete images
│   │   │   ├── login/
│   │   │   │   └── page.tsx        ← Admin login (/admin/login)
│   │   ├── api/                    ← API Routes (server-side only)
│   │   │   ├── booking/
│   │   │   │   └── route.ts        ← POST: submit booking
│   │   │   ├── time-slots/
│   │   │   │   └── route.ts        ← GET: available time slots by date
│   │   │   ├── cancel/
│   │   │   │   ├── route.ts        ← POST: cancel booking via token
│   │   │   │   └── lookup/
│   │   │   │       └── route.ts    ← GET: lookup booking details by cancel token
│   │   │   └── contact/
│   │   │       └── route.ts        ← POST: contact form submission
│   │   ├── globals.css             ← Tailwind v4 config + Moso Tea color palette
│   │   └── layout.tsx              ← Root layout (fonts, metadata)
│   ├── components/
│   │   ├── AnnouncementBanner.tsx  ← Homepage announcement rotating banner (fixed, bilingual, swipeable)
│   │   └── layout/
│   │       ├── Navigation.tsx      ← Global navigation bar
│   │       └── Footer.tsx          ← Global footer
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           ← Browser Supabase client (use in Client Components)
│   │   │   ├── server.ts           ← Server Supabase client (use in Server Components)
│   │   │   └── admin.ts            ← Service role Supabase client (use in API Routes, bypasses RLS)
│   │   ├── resend/
│   │   │   └── emails.ts           ← All email sending functions (4 types)
│   │   └── token.ts                ← Cancellation token generation & verification (HMAC-SHA256)
│   ├── types/
│   │   └── index.ts                ← Shared TypeScript types (TimeSlot, Booking, Gallery, etc.)
│   └── i18n/
│       ├── routing.ts              ← Locale routing config (en, zh-TW)
│       ├── request.ts              ← Message loading per locale
│       └── navigation.ts           ← Locale-aware Link, useRouter, etc.
├── messages/
│   ├── en.json                     ← English translations
│   └── zh-TW.json                  ← Traditional Chinese translations
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

### Overview

| Table | Purpose |
|---|---|
| `time_slots` | Stores bookable time slots |
| `bookings` | Stores customer booking records |
| `gallery` | Stores image metadata (files in Supabase Storage) |
| `announcements` | Stores bilingual announcements displayed on the homepage |

### Table: `time_slots`

Stores time slots set by the owner. Two fixed slots per day, batch-generated from the admin dashboard.

```sql
create table time_slots (
  id uuid primary key default gen_random_uuid(),
  start_time timestamptz not null,
  end_time timestamptz not null,
  max_guests int not null default 8,
  booked_guests int not null default 0,
  is_available boolean default true,
  created_at timestamptz default now()
);
```

**Time slot rules:**
- Two fixed slots per day: **10:00–11:30** and **14:00–15:30**
- Admin dashboard provides a "Generate Next 30 Days" button to batch-create slots
- A slot is unavailable when: `is_available = false` OR `booked_guests >= max_guests`

### Table: `bookings`

Stores all customer booking submissions.

```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  time_slot_id uuid references time_slots(id),
  customer_name text not null,
  email text not null,
  phone text not null,
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

**Status values:**

| `status` | Meaning |
|---|---|
| `pending` | Submitted, awaiting owner confirmation |
| `confirmed` | Owner confirmed |
| `cancelled` | Cancelled |

**`cancelled_by` values:**

| Value | Meaning |
|---|---|
| `customer` | Customer self-cancelled via cancellation link |
| `admin` | Owner cancelled from admin dashboard |

### Table: `gallery`

Stores image metadata. Actual image files are stored in Supabase Storage.

```sql
create table gallery (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  filename text not null,
  caption text,
  uploaded_at timestamptz default now()
);
```

### Table: `announcements`

Stores announcements created by admin. Displayed as a rotating banner on the homepage.

```sql
create table announcements (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_zh text not null,
  content_en text not null,
  content_zh text not null,
  is_active boolean default true,
  sort_order int not null default 0,
  created_at timestamptz default now()
);
```

**Announcement rules:**
- Multiple announcements can be active simultaneously
- Homepage displays active announcements as a top banner below the navigation bar
- When multiple announcements are active, they rotate automatically (fade out one, fade in the next)
- Admin can toggle `is_active` to show/hide individual announcements
- Bilingual: `title_en`/`content_en` for English, `title_zh`/`content_zh` for Traditional Chinese
- Displayed in the visitor's current locale

### Table Relationships

```
time_slots ──── bookings
  One slot        can have multiple bookings
                  total guests cannot exceed max_guests (8)
```

### Database Triggers

| Trigger | Table | When | Action |
|---|---|---|---|
| `bookings_updated_at` | bookings | Before update | Auto-update `updated_at` |
| `bookings_check_guests` | bookings | Before insert | Check capacity, update `booked_guests` |
| `bookings_release_guests` | bookings | After update | Release `booked_guests` on cancellation |

### RLS (Row Level Security) Policies

| Table | Operation | Access |
|---|---|---|
| `time_slots` | SELECT | All users (anon) |
| `time_slots` | INSERT / UPDATE / DELETE | Authenticated only (admin) |
| `bookings` | INSERT | All users (anon) |
| `bookings` | SELECT / UPDATE | Authenticated only (admin) |
| `gallery` | SELECT | All users (anon) |
| `gallery` | INSERT / UPDATE / DELETE | Authenticated only (admin) |
| `announcements` | SELECT | All users (anon) |
| `announcements` | INSERT / UPDATE / DELETE | Authenticated only (admin) |

---

## Key Business Rules

### Booking Rules
- Only one experience offered: **The Workshop** (90 min, NZD $75/person, max 8 guests)
- Two time slots per day: **10:00–11:30 AM** and **2:00–3:30 PM**
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
- When customer self-cancels: customer receives `sendCancellationConfirmation`, admin receives `sendCancellationNotice`
- When admin cancels: customer receives `sendCancellationConfirmation` only (admin already knows)
- `cancelled_by` records the source: `customer` or `admin`

### Admin Rules
- Admin dashboard only accessible to authenticated users (Supabase Auth)
- Unauthenticated users redirected to `/admin/login`
- Admin dashboard supports bilingual switching (English / Traditional Chinese)
- Admin locale is stored in a cookie (`admin_locale`), default: `zh-TW`
- Language switcher is located in the admin sidebar (same visual style as public navigation)
- Admin can confirm, cancel, and view all bookings
- Admin can add, remove, and toggle availability of time slots
- Admin can generate next 30 days of time slots in bulk
- Admin can create, edit, toggle, and delete announcements (bilingual)
- Admin can upload, delete, and manage gallery images (Supabase Storage)

### Announcement Rules
- Announcements are displayed as a **fixed top banner** on the homepage, positioned below the navigation bar (`fixed top-16 z-40`)
- Multiple announcements can be active at the same time
- When multiple are active, they **rotate automatically** every 5 seconds with fade transition
- Users can manually switch announcements via **left/right arrows**, **clickable dot indicators**, or **touch swipe** (mobile)
- Manual interaction resets the auto-rotate timer
- `sort_order` controls the display order; admin can **drag to reorder** using `@dnd-kit` in the admin dashboard
- New announcements are appended at the end (`sort_order = max + 1`)
- Each announcement has bilingual content (`title_en`/`content_en` and `title_zh`/`content_zh`)
- The homepage displays the announcement in the visitor's **current locale**
- Admin can toggle `is_active` to show/hide announcements without deleting them
- Users can dismiss the banner via a centered "Dismiss" / "關閉通知" link below the content

### Gallery Rules
- Gallery images are stored in **Supabase Storage** (bucket: `gallery`)
- The `gallery` table stores metadata (url, filename, caption)
- Homepage displays a Gallery section showing images from the database
- The About page's previous hardcoded gallery is replaced by this dynamic gallery
- Caption is single-language (not bilingual)
- Admin can upload images, edit captions, and delete images
- Deleting an image removes both the Storage file and the database record
- `next/image` is used for optimized loading (requires Supabase Storage domain in `next.config.ts`)

---

## Email Functions (src/lib/resend/emails.ts)

| Function | Recipient | Trigger |
|---|---|---|
| `sendBookingReceived` | Customer | When customer submits booking (status: `pending`) |
| `sendBookingNotification` | Admin/Owner | When customer submits booking |
| `sendBookingConfirmation` | Customer | When admin confirms a booking, or admin creates a booking directly (includes cancellation link) |
| `sendCancellationConfirmation` | Customer | When booking is cancelled — by customer self-cancel or by admin |
| `sendCancellationNotice` | Admin/Owner | When customer self-cancels only (not sent for admin-initiated cancellations) |

All emails respect `preferred_language` — English or Traditional Chinese (zh-TW).

---

## Supabase Client Usage

```typescript
// In Client Components ("use client")
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// In Server Components (respects RLS, uses anon key)
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// In API Routes that need to bypass RLS (service role key)
import { createAdminClient } from '@/lib/supabase/admin'
const supabase = createAdminClient()
```

---

## API Routes

### `GET /api/time-slots?date=YYYY-MM-DD`

Returns available time slots for a given date.

**Query params:** `date` (required, format `YYYY-MM-DD`)

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "start_time": "iso", "end_time": "iso", "remaining": 6 }
  ]
}
```

- Filters out slots where `is_available = false` or `booked_guests >= max_guests`
- Filters out slots within 2.5 hours of current time (prevents last-minute bookings)
- Uses admin client (service role) to bypass RLS

### `POST /api/booking`

Submits a new booking request.

**Request body:**
```json
{
  "timeSlotId": "uuid",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "guests": 1,
  "specialRequests": "string (optional)",
  "preferredLanguage": "en | zh"
}
```

**Response:** `{ "success": true, "data": { "bookingId": "uuid" } }`

**Validation rules:**
- `fullName`: 2–30 chars, Chinese or English characters only
- `email`: max 100 chars, valid email format
- `phone`: max 20 chars, 7–15 digits (E.164 international)
- `guests`: 1–8 integer
- `specialRequests`: max 200 chars

**Flow:**
1. Validate input with Zod
2. Check time slot exists, is available, and has capacity
3. Check slot is in the future
4. Insert booking (DB trigger updates `booked_guests`)
5. Generate HMAC cancellation token, store on booking
6. Send confirmation email to customer + notification to owner
7. Emails are non-blocking — booking succeeds even if email fails

### `GET /api/cancel/lookup?token=xxx`

Returns booking details for a cancellation token without performing the cancellation. Used by the cancellation page to display booking info before the user confirms.

**Response:**
```json
{
  "success": true,
  "data": {
    "customerName": "string",
    "guestCount": 1,
    "startTime": "iso",
    "status": "pending",
    "isCancellable": true,
    "preferredLanguage": "en"
  }
}
```

- Returns `isCancellable: false` when less than 24 hours before session
- Error codes: `invalid`, `already_cancelled`, `expired`
- Only exposes non-sensitive data (no email, no phone)

### `POST /api/cancel`

Cancels a booking via cancellation token.

**Request body:** `{ "token": "string" }`

**Response:** `{ "success": true }`

**Flow:**
1. Find booking by `cancellation_token`
2. Check booking is not already cancelled
3. Check token hasn't expired (expires at session start time)
4. Check 24-hour cutoff (must be >24h before session)
5. Update status to `cancelled`, set `cancelled_by = 'customer'`, clear token
6. DB trigger releases `booked_guests`
7. Send cancellation emails to customer + owner

**Error responses include `tooLate: true`** when within 24 hours — frontend can show a "contact us" message.

### `POST /api/contact`

Sends a contact form message to the owner via email.

**Request body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string (optional)",
  "message": "string (min 10 chars)"
}
```

### Admin Server Actions

Admin operations use Next.js Server Actions instead of API routes:

- `src/app/admin/(dashboard)/bookings/_actions.ts` — `getBookings`, `confirmBooking`, `cancelBooking`, `createBooking`, `updateBooking`, `getAvailableSlots`
- `src/app/admin/(dashboard)/slots/_actions.ts` — `generateSlots`, `toggleSlot`
- `src/app/admin/(dashboard)/announcements/_actions.ts` — `getAnnouncements`, `createAnnouncement`, `updateAnnouncement`, `deleteAnnouncement`, `toggleAnnouncement`, `reorderAnnouncements`
- `src/app/admin/(dashboard)/gallery/_actions.ts` — `getGalleryImages`, `uploadImage`, `deleteImage`

---

## Cancellation Token (src/lib/token.ts)

- **Algorithm:** HMAC-SHA256 signed with `CANCELLATION_TOKEN_SECRET`
- **Format:** `base64url(bookingId:random:hmac)`
- **Single-use:** Token is cleared after successful cancellation
- **Expiry:** Token expires at session start time (stored in `cancellation_token_expires_at`)
- `generateCancellationToken(bookingId)` — creates a new token
- `verifyCancellationToken(token)` — returns `{ valid, bookingId }` (structural check only, DB lookup needed for full validation)

---

## Bilingual (i18n) Requirements

- Default language: **English**
- Secondary language: **Traditional Chinese (zh-TW)**
- Library: **next-intl** (v4)
- Language toggle in navigation bar on all public pages
- URL-based locale routing: `/about` (English default), `/zh-TW/about` (Chinese)
- Locale prefix mode: `as-needed` (English has no prefix, zh-TW has prefix)
- **Single-language display rule:** Each page must only display content in the current locale. Do NOT show both languages simultaneously (e.g., English title with Chinese subtitle). The language switcher in the navigation bar handles locale changes — users switch languages via the toggle, not by seeing both on screen.
- **All new public pages must support bilingual switching:**
  1. Place pages under `src/app/[locale]/(public)/`
  2. Use `useTranslations` (client) or `getTranslations` (server) from `next-intl`
  3. Use `Link` from `@/i18n/navigation` instead of `next/link`
  4. Add all user-facing strings to `messages/en.json` and `messages/zh-TW.json`
  5. Do NOT add `Zh` suffix keys (e.g., `titleZh`, `labelZh`) — each locale has its own complete translation file
- All public page content, form labels, error messages, and emails must be translated
- Admin dashboard supports **bilingual switching** (English / Traditional Chinese) via cookie-based locale
- Admin does **not** use URL-based locale routing (no `[locale]` segment) — locale is stored in `admin_locale` cookie
- Admin layout wraps children with `NextIntlClientProvider` using the cookie locale
- Admin translation keys are under the `admin` namespace in `messages/en.json` and `messages/zh-TW.json`
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

## Known Issues & Cautions

### Database Column Names
The actual `bookings` table uses `email` and `phone` (not `customer_email` / `customer_phone`). Always verify column names against the live schema before writing Supabase queries — the schema in this file is the source of truth.

### Timezone-Aware Supabase Queries
When filtering `timestamptz` columns by NZ date, always convert to UTC first. Passing a bare date string like `2026-03-26T00:00:00` is treated as UTC by Supabase, which will miss NZ morning slots stored as the previous UTC day.

```typescript
// ✅ Correct — covers both NZDT (+13) and NZST (+12)
const startUTC = new Date(`${dateStr}T00:00:00+13:00`).toISOString()
const endUTC   = new Date(`${dateStr}T23:59:59+12:00`).toISOString()

// ❌ Wrong — treated as UTC, misses NZ morning slots
.gte('start_time', `${dateStr}T00:00:00`)
```

### DST-Aware Slot Generation
Use `Intl.DateTimeFormat.formatToParts` to get the correct NZ UTC offset per date. Do **not** use `toLocaleString` for offset calculation — it behaves incorrectly on Windows. See `_actions.ts` `getNZOffset()` for the correct implementation.

### Avoid the `nzNow` Hack for Date Arithmetic
Do **not** use `new Date(now.toLocaleString('en-US', { timeZone: NZ_TZ }))` to create a "fake" NZ Date object for date arithmetic. This creates a Date whose internal UTC timestamp depends on the server's timezone. When `toLocaleDateString` with NZ timezone is later applied, it **double-converts**, causing off-by-one day errors on Vercel (UTC server) vs local development.

```typescript
// ❌ Wrong — double-converts timezone, off-by-one on Vercel
const nzNow = new Date(now.toLocaleString('en-US', { timeZone: NZ_TZ }))
const target = new Date(nzNow); target.setDate(nzNow.getDate() + 30)
const targetStr = toNZDateStr(target) // shifted by 1 day on UTC servers

// ✅ Correct — use date string arithmetic
const todayStr = toNZDateStr(new Date()) // one correct timezone conversion
const [y, m, d] = todayStr.split('-').map(Number)
const targetStr = new Date(Date.UTC(y, m - 1, d + 30)).toISOString().slice(0, 10)
```

### setState in useEffect (ESLint Error)
Calling `setState` inside `useEffect` triggers `react-hooks/set-state-in-effect`. For modals and forms that receive initial data via props, use **lazy state initializers** instead:

```typescript
// ✅ Correct
const [name, setName] = useState(() => booking?.customer_name ?? '')

// ❌ Wrong — causes ESLint error
useEffect(() => { setName(booking.customer_name) }, [booking])
```

### Email Functions — Trigger Summary
- `sendBookingReceived` — sent to customer when they submit (status: `pending`). Subject: "Booking Received"
- `sendBookingNotification` — sent to admin when customer submits. Not sent for admin-created bookings.
- `sendBookingConfirmation` — sent to customer when admin confirms, or when admin creates a booking directly. Subject: "Booking Confirmed"
- `sendCancellationConfirmation` — sent to customer on any cancellation (customer or admin initiated)
- `sendCancellationNotice` — sent to admin only when customer self-cancels. Not sent when admin cancels.

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
| Sprint 0 | Project setup, DB schema, Figma wireframes | ✅ Done |
| Sprint 1 | Core information pages + i18n | ✅ Done |
| Sprint 2 | Booking system + cancellation emails | ✅ Done |
| Sprint 3 | Admin dashboard + self-cancellation | ✅ Done |
| Sprint 4 | Testing, performance, launch | 🔄 In Progress |
| Sprint 5 | Announcements + Gallery management | ⏳ Pending |