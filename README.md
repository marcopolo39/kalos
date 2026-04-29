# Kalos

Turborepo monorepo — member dashboard and AI coach for body composition tracking.

## Apps

| App | Path | Description | Port |
|-----|------|-------------|------|
| `web` | `apps/web` | Member dashboard (Supabase Auth, anon key) | 3000 |
| `membergpt` | `apps/membergpt` | MemberGPT AI coach chat (service_role key, no end-user auth) | 3001 |

## Stack

| Layer | Choice |
|-------|--------|
| Monorepo | Turborepo + pnpm |
| Framework | Next.js 16 (App Router) + TypeScript strict |
| Styling | Tailwind CSS v4 |
| Database / Auth | Supabase (Postgres + email-password auth) |
| DB client | `@supabase/supabase-js` + generated TS types — no ORM |
| Charts | Recharts |
| AI | Vercel AI SDK + Anthropic Claude |
| Migrations | Raw SQL in `supabase/migrations/` |
| Deploy | Vercel |

## Prerequisites

- Node ≥ 18
- pnpm — `brew install pnpm`
- A Supabase project — grab the **Project URL**, **anon key**, and **service-role key** from Settings → API
- Anthropic API key (MemberGPT only)
- Google Generative AI API key (web app AI features)

## Run locally

```bash
# 1. Clone
git clone https://github.com/marcopolo39/kalos && cd kalos

# 2. Install dependencies
pnpm install

# 3. Copy env templates and fill in credentials
cp apps/web/.env.example apps/web/.env.local
cp apps/membergpt/.env.example apps/membergpt/.env.local
# edit both .env.local files

# 4. Start all dev servers
pnpm dev

# Or start a single app
pnpm dev:web        # http://localhost:3000
pnpm dev:membergpt  # http://localhost:3001
```

## Environment variables

### `apps/web`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI key for scan analysis |

### `apps/membergpt`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key — bypasses RLS for cross-member reads |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |

## Seed demo data

Populate the database with 6 demo members covering all dashboard personas:

```bash
# Add SUPABASE_SERVICE_ROLE_KEY to a root .env.local first, then:
pnpm seed
```

The script is idempotent — running it again deletes and recreates the seed rows.

### Demo credentials

| Member | Email | Password | Scans | Story |
|--------|-------|----------|-------|-------|
| Sarah | `sarah@demo.kalos.dev` | `password123` | 1 | First-scan UI |
| Jordan | `jordan@demo.kalos.dev` | `password123` | 2 | Mild fat loss + lean gain |
| Alex | `alex@demo.kalos.dev` | `password123` | 5 | Steady cut, lean preserved |
| Taylor | `taylor@demo.kalos.dev` | `password123` | 3 | Lean mass regression (last scan) |
| Morgan | `morgan@demo.kalos.dev` | `password123` | 6 | Weight-stable recomp |
| Casey | `casey@demo.kalos.dev` | `password123` | 4 | Bulking phase (lean up, fat stable, weight up) |

## Database

### Schema

Three tables — all with RLS enabled, owner-only model:

- **`members`** — linked 1:1 to `auth.users`. Auto-created by `handle_new_user()` trigger on signup.
- **`scans`** — wide flat table (~28 columns). Unique on `(member_id, scan_date, external_scan_id)`.
- **`member_goals`** — JSONB `metrics` array tracking direction and optional target values.

### Migrations

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Link to your project
supabase link --project-ref <your-project-ref>

# Push migrations
supabase db push
```

### Generate TypeScript types

After any schema change:

```bash
supabase gen types typescript --local > packages/supabase/database.types.ts
```

## Deploy

Production URL: **https://kalos-iota.vercel.app**

Vercel deploys automatically on push to `main`. Preview deployments are created for PRs.

Set the env vars above in Vercel → Project Settings → Environment Variables for each app.
