<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Git rules

- **Never commit or push without explicit user instruction.** Do not run `git commit`, `git push`, `gh pr create`, or any equivalent on your own. Always stop after implementing changes and wait for the user to review before committing or pushing.

# Kalos Project Conventions

Turborepo monorepo with two Next.js 16 (App Router) + TypeScript strict apps sharing one Supabase project.

- `apps/web` — member dashboard (Supabase Auth, anon key, email/password)
- `apps/membergpt` — MemberGPT coach chat (service_role key, no end-user auth)
- `supabase/migrations/` — timestamped raw SQL
- `packages/` — shared code (types, utils)

Stack: pnpm, Tailwind, Recharts, Vercel AI SDK, Zod.

## Key conventions

- No ORM — typed Supabase client only
- UUIDs as PKs everywhere
- Named exports (except Next.js page/layout)
- `interface` over `type` for object shapes
- `as const` objects or Zod enums, never TS `enum`
- `async/await`, never `.then()` chains
- Server Components by default; `"use client"` only when needed
- Validate all external input with Zod
- Components under 200 lines; extract hooks and sub-components
- Always regenerate types after migration changes: `supabase gen types typescript --local > packages/supabase/database.types.ts`

## Design System

Derived from the live Kalos brand at livekalos.com. Match this exactly in both apps.

**Palette:**
- Background: `bg-white` (`#FFFFFF`) — all page and card backgrounds
- Primary black: `bg-black` / `text-black` (`#0A0A0A`) — nav, headers, dark surfaces
- Brand blue: `bg-blue-700` / `text-blue-700` (`#1D4ED8`) — primary CTAs, active states, chart accent
- Body text: `text-neutral-900` on white; `text-white` on black/blue
- Muted/secondary text: `text-neutral-500`
- Borders: `border-neutral-200` on white surfaces; `border-white/10` on dark surfaces

**Tokens in practice:**
- Primary button: `bg-blue-700 hover:bg-blue-800 text-white`
- Nav/header bar: `bg-black text-white`
- Page shell: `bg-white`
- Cards: `bg-white border border-neutral-200 rounded-lg`
- Selected/active card: `ring-2 ring-blue-700`
- Chart primary line: `stroke-blue-700` / `#1D4ED8`
- Improvement delta (↑ lean, ↓ fat): `text-green-600`
- Regression delta: `text-red-600`
- Stable delta: `text-neutral-500`

Never use dark-mode classes, dark backgrounds on cards, or gray/colored backgrounds on page shells.

## Never

- Expose service_role key in client bundles
- Store BMI, ethnicity, or scan_type (product decisions)
- Use barrel exports except for tool registries
- Write arbitrary SQL in MemberGPT — use typed queries or safe SQL primitives

# Linear Ticket Ambiguity Protocol

When implementing a Linear ticket, read the full description and acceptance criteria before writing any code. If any requirement is vague, under-specified, or has meaningful trade-offs, **stop and ask before implementing**. Never assume.

## When to ask

Ask whenever you encounter:
- A decision that affects security, data access, or schema design
- Two or more plausible implementations with meaningfully different trade-offs
- Missing constraints (e.g. expiry time, file size limit, allowed formats, error behavior)
- Acceptance criteria that are impossible to meet without a product decision (e.g. "users can download" — via what mechanism?)

## How to ask

For each ambiguous point, structure your question as:

1. **The gap** — what specific detail is missing or unclear
2. **Options** — the realistic choices (usually 2–4)
3. **Reason for each** — one sentence per option explaining the trade-off, not just what it does
4. **Your recommendation** — state which you'd pick and why

Ask **one question at a time**. Wait for the answer before asking the next. Never batch multiple questions into a single message.

## Example format

> **Gap:** The ticket says "users can download their scan" but doesn't specify the mechanism.
>
> **Options:**
> - **Signed URL (5 min expiry)** — server generates a short-lived link on demand. Secure, can't be shared long-term. Best for a dashboard "download" button.
> - **Signed URL (24 hr expiry)** — same but survives longer sessions or could be emailed. Slightly more exposure risk.
> - **Descope downloads** — only show extracted data in the dashboard, no raw file access. Simplest; removes the feature entirely.
>
> **Recommendation:** Signed URL at 5 min — tight security, fits the dashboard flow.

## Never

- Implement a vague requirement by making an assumption — always ask first
- Ask about things that are already clear in the ticket or inferable from project conventions
- Ask multiple questions at once
