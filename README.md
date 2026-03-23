# Moso Tea — mosotea.co.nz

A bilingual (English / Traditional Chinese) website for Moso Tea, a New Zealand-based artisan tea experience studio offering immersive, hands-on tea ceremony sessions in Wellington.

Built with Next.js, TypeScript, Tailwind CSS, Supabase, and Resend.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (admin only) |
| Email | Resend |
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

> **Note:** `SUPABASE_SERVICE_ROLE_KEY` and `CANCELLATION_TOKEN_SECRET` must never be exposed to the browser.

### 4. Run the development server

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

## Git Workflow

```
main          ← Production (auto-deploys to Vercel)
  └── develop ← Development branch
        ├── feature/xxx
        └── fix/xxx
```

- All PRs target `develop`
- `develop` is merged into `main` at the end of each sprint

## Project Structure

```
src/
├── app/
│   ├── (public)/        ← Public-facing pages
│   ├── admin/           ← Protected admin dashboard
│   ├── api/             ← API routes
│   ├── layout.tsx       ← Root layout
│   └── globals.css      ← Global styles
├── components/
│   ├── ui/              ← Base UI components
│   └── layout/          ← Layout components (Navbar, Footer)
├── lib/                 ← Utilities (Supabase clients, email, helpers)
├── types/               ← Shared TypeScript types
└── i18n/                ← Translation files (EN, zh-TW)
```

## License

See [LICENSE](LICENSE) for details.
