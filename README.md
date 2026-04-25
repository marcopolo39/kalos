# Kalos

Member dashboard and AI coach (MemberGPT) — a Next.js + Supabase monolith.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database / Auth | Supabase (Postgres + email-password auth) |
| DB client | `@supabase/supabase-js` + generated TS types — no ORM |
| Migrations | Raw SQL files in `supabase/migrations/` |
| Package manager | pnpm |
| Deploy | Vercel |

Two route groups share one repo and one auth context:

- `/dashboard/*` — member-facing app
- `/coach/*` — MemberGPT AI coach

## Prerequisites

- Node ≥ 18
- pnpm — `brew install pnpm`
- A Supabase project ([supabase.com](https://supabase.com)) — grab the **Project URL** and **anon public key** from Settings → API

## Run locally

```bash
# 1. Clone
git clone https://github.com/marcopolo39/kalos && cd kalos

# 2. Install dependencies
pnpm install

# 3. Copy env template and fill in your Supabase credentials
cp .env.example .env.local
# edit .env.local

# 4. Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to `/dashboard`.

## Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key — required for `pnpm seed` only (Supabase → Settings → API) |

## Seed demo data

Populate the database with 6 demo members covering all dashboard personas:

```bash
# Add SUPABASE_SERVICE_ROLE_KEY to .env.local first, then:
pnpm seed
```

The script is idempotent — running it again deletes and recreates the seed rows.

### Demo credentials

| Member | Email | Password | Scans | Story |
|--------|-------|----------|-------|-------|
| Sarah | `sarah@demo.kalos.dev` | `password123` | 1 | First-scan UI |
| Jordan | `jordan@demo.kalos.dev` | `password123` | 2 | Mild fat loss + lean gain |
| Alex | `alex@demo.kalos.dev` | `password123` | 5 | Steady cut, lean preserved |
| Taylor | `taylor@demo.kalos.dev` | `password123` | 4 | Lean mass regression (last scan) |
| Morgan | `morgan@demo.kalos.dev` | `password123` | 6 | Weight-stable recomp |
| Casey | `casey@demo.kalos.dev` | `password123` | 3 | Plateau pattern |

## Database migrations

SQL migration files live in `supabase/migrations/`. Run them against your Supabase project via the Supabase CLI:

```bash
# Install CLI (if not already)
brew install supabase/tap/supabase

# Link to your project
supabase link --project-ref <your-project-ref>

# Push migrations
supabase db push
```

## Generate TypeScript types

After schema changes:

```bash
supabase gen types typescript --project-id <your-project-ref> --schema public > types/supabase.ts
```

## Deploy

Production URL: **https://kalos-iota.vercel.app**

The project is deployed on Vercel. Each push to `main` triggers a new production deployment. Preview deployments are created automatically for PRs.

To deploy manually:

```bash
vercel --prod
```

Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in your Vercel project environment variables (Settings → Environment Variables).
