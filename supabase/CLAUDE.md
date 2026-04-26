# Database Conventions

## Schema — 3 tables

`members` — PK is `auth.users.id`. Trigger `handle_new_user()` auto-creates row on signup (SECURITY DEFINER). Requires `name`, `dob`, `sex` in `raw_user_meta_data`.

`scans` — wide flat, ~28 columns. UNIQUE on `(member_id, scan_date, external_scan_id)`. Index on `(member_id, scan_date DESC)`.

`member_goals` — JSONB `metrics` array: `{ metric, direction, baseline_value, baseline_scan_id, target_value? }`

- Valid metrics: `tbf_pct | almi | vat_area_cm2 | weight_lb`
- Valid directions: `decrease | increase | maintain`
- `target_value` is optional — enables progress % when present, direction-only when absent
- Validated with Zod in app layer, not Postgres

## Row-Level Security

RLS enabled on every table + `scans` storage bucket. Owner-only model.

- `scans`, `member_goals`: `using (member_id = auth.uid()) with check (member_id = auth.uid())`
- `members`: `using (id = auth.uid()) with check (id = auth.uid())`
- Storage: `bucket_id = 'scans' and (storage.foldername(name))[1] = auth.uid()::text`
- Path convention: `scans/<member_id>/<scan_id>.pdf`

No coach/admin role at DB layer. Cross-member reads use service_role key server-side only.

## Migrations

- Raw SQL in `supabase/migrations/` with timestamped names
- Apply: `supabase db push`
- After any change: `supabase gen types typescript --local > packages/supabase/database.types.ts`
- Seed scripts must run with service_role key (RLS blocks anon inserts)

## Auth

- Dashboard: Supabase Auth, email/password, anon key in browser
- MemberGPT: service_role key, server-side only, bypasses RLS entirely
- Signup form must enforce name/dob/sex presence before calling `auth.signUp`

# Seed Data — 6 Members

Must run with service_role key (RLS blocks anon inserts). Creates auth.users entries via Supabase Admin API, which triggers `handle_new_user()` to auto-create members rows.

## Personas

- **Sarah** — 1 scan (recent). Tests first-scan UI. Female, early 30s.
- **Jordan** — 2 scans, 1 month apart. Mild fat loss + lean gain. Male, mid 25s.
- **Alex** — 5 scans over 4 months. Steady cut + lean preservation. Male, late 20s.
- **Taylor** — 3 scans. Regressing (gaining fat, losing lean). Female, mid 30s. Tests the "bad news" UI path.
- **Morgan** — 6 scans over 6 months. Recomp story (fat down, lean up, weight stable). Female, late 20s.
- **Casey** — 4 scans. Bulking phase (lean up, fat stable, weight up). Male, early 20s.

## Realistic ranges (adults, mixed demographics)

- tbf_pct: 15–35% (males lower, females higher)
- almi: 6.5–10.0 kg/m² (males higher)
- vat_area_cm2: 40–120 cm²
- weight_lb: 120–210 lb
- Regional lean/fat should sum to approximately total body mass minus bone

## Demo credentials

Each member gets an email/password login. Document credentials in README.
Format: `<name>@demo.kalos.dev` / `password123`

## Goals

At least Sarah, Jordan, and Alex should have goals set. Include a mix of target_value present and absent to test both progress UI paths.
