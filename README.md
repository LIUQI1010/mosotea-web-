# Moso Tea — mosotea.co.nz

A bilingual (English / Traditional Chinese) website for Moso Tea, a New Zealand-based artisan tea experience studio offering immersive, hands-on tea ceremony sessions in Wellington.

Built with Next.js, TypeScript, Tailwind CSS, Supabase, and Resend.

## Features

- **Bilingual support** — English and Traditional Chinese (zh-TW) with URL-based locale routing via next-intl
- **Online booking system** — Date picker, time slot selection, guest count, and real-time capacity checking
- **Automated emails** — Booking confirmation, admin notification, and cancellation emails via Resend
- **Customer self-cancellation** — Secure HMAC-SHA256 token-based cancellation links with 24-hour cutoff
- **Admin dashboard** — View/confirm/cancel bookings, manage time slots, calendar view, responsive design
- **Time slot management** — Bulk generation (next 30 days), toggle availability, capacity tracking
- **SEO optimised** — Sitemap, robots.txt, meta tags for all pages
- **Responsive design** — Mobile-first layout across all public and admin pages

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (admin only) |
| Email | Resend |
| i18n | next-intl v4 |
| Deployment | Vercel |
| Domain & CDN | Cloudflare |

## Prerequisites

- [Node.js](https://nodejs.org/) v18.18 or later
- npm (comes with Node.js)
- A [Supabase](https://supabase.com/) project
- A [Resend](https://resend.com/) account

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/LIUQI1010/mosotea-web-.git
cd mosotea-web-
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key (safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `RESEND_API_KEY` | Resend API key for sending emails |
| `NEXT_PUBLIC_APP_URL` | App URL, e.g. `http://localhost:3000` |
| `CANCELLATION_TOKEN_SECRET` | Random 32-byte hex string for signing cancel tokens |
| `OWNER_EMAIL` | Business owner email for booking notifications |

> **Note:** `SUPABASE_SERVICE_ROLE_KEY` and `CANCELLATION_TOKEN_SECRET` must never be exposed to the browser.

### 4. Set up the database

Create the following tables in your Supabase project:

```sql
-- Time slots
create table time_slots (
  id uuid primary key default gen_random_uuid(),
  start_time timestamptz not null,
  end_time timestamptz not null,
  max_guests int not null default 8,
  booked_guests int not null default 0,
  is_available boolean default true,
  created_at timestamptz default now()
);

-- Bookings
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

-- Gallery (image metadata)
create table gallery (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  filename text not null,
  caption text,
  uploaded_at timestamptz default now()
);
```

Then set up the required database triggers:

- `bookings_updated_at` — Auto-update `updated_at` on bookings
- `bookings_check_guests` — Check capacity and update `booked_guests` on insert
- `bookings_release_guests` — Release `booked_guests` on cancellation

And configure RLS policies:

| Table | SELECT | INSERT | UPDATE/DELETE |
|---|---|---|---|
| `time_slots` | All users | Authenticated | Authenticated |
| `bookings` | Authenticated | All users | Authenticated |
| `gallery` | All users | Authenticated | Authenticated |

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server locally |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/
│   ├── [locale]/(public)/  ← Public pages with i18n locale routing
│   │   ├── page.tsx        ← Home page
│   │   ├── about/          ← About Us
│   │   ├── workshop/       ← Workshop details
│   │   ├── book/           ← Booking form
│   │   ├── contact/        ← Contact page
│   │   ├── privacy/        ← Privacy Policy
│   │   ├── terms/          ← Terms of Service
│   │   └── cancel/[token]/ ← Customer self-cancellation
│   ├── admin/              ← Protected admin dashboard (English only)
│   │   ├── (dashboard)/    ← Dashboard, bookings, slots management
│   │   └── login/          ← Admin login
│   ├── api/                ← API routes (booking, time-slots, cancel, contact)
│   ├── layout.tsx          ← Root layout (fonts, metadata)
│   └── globals.css         ← Tailwind v4 config + colour palette
├── components/
│   └── layout/             ← Navigation, Footer
├── lib/
│   ├── supabase/           ← Supabase clients (browser, server, admin)
│   ├── resend/             ← Email sending functions
│   └── token.ts            ← Cancellation token generation & verification
├── types/                  ← Shared TypeScript types
└── i18n/                   ← i18n config (routing, navigation, request)
messages/
├── en.json                 ← English translations
└── zh-TW.json              ← Traditional Chinese translations
```

## Git Workflow

```
main          ← Production (auto-deploys to Vercel)
  └── develop ← Development branch
        ├── feature/xxx
        └── fix/xxx
```

- All PRs target `develop`
- `develop` is merged into `main` at the end of each sprint

## Deployment

The project auto-deploys to Vercel on push to `main`.

1. Connect the GitHub repository to Vercel
2. Set all environment variables in Vercel project settings
3. Configure Cloudflare DNS to point `mosotea.co.nz` to Vercel
4. Vercel automatically provisions HTTPS via Let's Encrypt

## License

See [LICENSE](LICENSE) for details.
