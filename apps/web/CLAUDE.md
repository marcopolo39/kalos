# Member Dashboard (`apps/web`)

Auth-gated with Supabase email/password. Uses the anon key — RLS enforces owner-only access.

## Three dashboard personas (based on scan count)

**First scan (1 scan):**
- Education-focused — explain what numbers mean in plain English
- No charts, no trends, no "no data" empty states
- Show: tbf_pct + percentile, ALMI + percentile, VAT area, weight, bone density (T/Z score)
- CTA to set goals (navigates to goal capture flow)

**Second scan (2 scans):**
- Delta-focused — "the most exciting moment for most members"
- Delta cards: current value, arrow + delta, color-coded (improved / regressed / stable)
- Improvement direction: tbf_pct ↓, lean mass ↑, vat_area ↓, almi ↑
- Show both scan dates + time between scans

**Returning member (3+ scans):**
- Full trend visualization with Recharts
- Charts: tbf_pct, total lean mass, vat_area_cm2, almi over time
- Goal overlay: first-scan baseline as reference line, target as dashed line
- Regional lean/fat breakdown (body map or grouped bar chart)

## Scan upload

- Accept PDF upload → store in Supabase Storage (`scans/<member_id>/<scan_id>.pdf`)
- Parse via server action calling Gemini 3 Flash structured output
- Save extracted data to `scans` table
- New scan immediately appears on dashboard (revalidate or optimistic update)

## Component patterns

- Error boundary per persona view
- Loading skeletons, not spinners
- Recharts for all charts — responsive containers

## Design system

- Page background: `bg-white`
- Nav/header: `bg-black text-white`
- Cards: `bg-white border border-neutral-200 rounded-lg shadow-sm`
- Primary button: `bg-blue-500 hover:bg-blue-600 text-white rounded-xl`
- Active/selected states: `ring-2 ring-blue-500`
- Body text: `text-neutral-900`; muted: `text-neutral-500`
- Chart primary series: `#3B82F6` (blue-500)
- Improvement delta: `text-green-600`; regression: `text-red-600`; stable: `text-neutral-500`
- Section headers: `text-black font-semibold tracking-tight`

Do not use dark-mode card backgrounds, gray page backgrounds, or colored surface fills.

# PDF Scan Extraction

LLM-based parser, not deterministic regex. Handles Hologic DEXA report format and should generalize to other formats.

## Pipeline

1. Client uploads PDF → store in Supabase Storage (`scans/<member_id>/<scan_id>.pdf`)
2. Server action sends raw PDF bytes to Gemini 3 Flash with schema-enforced structured output
3. Gemini returns JSON matching `scans` table columns
4. Validate with Zod schema before INSERT
5. Upsert into `scans` (UNIQUE constraint prevents double-uploads)

## Extracted fields (from Hologic DEXA report)

- Identity: scan_date, external_scan_id (e.g. "A0622240C")
- Device: device_model ("Horizon Wi"), device_serial ("308822M"), software_version
- Anthropometric: weight_lb, height_in
- Composition: tbf_pct, tbf_pct_pctile_yn, tbf_pct_pctile_am, vat_area_cm2, almi, almi_pctile_yn, almi_pctile_am
- Bone: total_bmd, total_t_score, total_z_score
- Regional (5 regions × lean + fat): l_arm, r_arm, trunk, l_leg, r_leg — each with _lean_mass and _fat_mass

## Gemini structured output

Define a JSON schema matching the scans table columns. Use `responseMimeType: "application/json"` with `responseSchema` — Gemini 3 Flash enforces the schema, no post-hoc parsing needed.

## Not extracted (by design)

BMI, ethnicity, per-region fat %, per-region BMD/T-score/Z-score, android/gynoid ratio, trunk/limb ratio, VAT mass/volume (redundant with VAT area).
