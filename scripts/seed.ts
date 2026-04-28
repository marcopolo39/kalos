/**
 * Seed script: 6 demo members covering all 3 dashboard personas.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (service role bypasses RLS).
 *
 * Usage: pnpm seed
 */

import { createClient } from "@supabase/supabase-js";
import type { Database, TablesInsert } from "../packages/supabase/database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// Derived from the generated schema — stays in sync with migrations automatically.
type ScanRow = TablesInsert<"scans">;

// JSONB columns are typed as `Json` in the generated file; keep the shape local.
type GoalMetric = {
  metric: "tbf_pct" | "almi" | "vat_area_cm2" | "weight_lb";
  direction: "decrease" | "increase" | "maintain";
  baseline_value: number;
  baseline_scan_id: string;
  target_value?: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Rounds a number to a fixed number of decimal places.
 *
 * @param n   - The number to round.
 * @param dec - Decimal places to keep (default: 2).
 * @returns   The rounded number.
 */
function r(n: number, dec = 2) {
  return Math.round(n * 10 ** dec) / 10 ** dec;
}

/**
 * Derives per-region lean and fat mass values from scan-level DEXA metrics.
 * Uses fixed anatomical proportions (arms ≈ 37 %, legs ≈ 63 % of appendicular lean)
 * to split total lean/fat into the 5 regions the schema stores.
 *
 * @param weightLb   - Total body weight in pounds.
 * @param tbfPct     - Total body fat percentage (e.g. 22.4).
 * @param heightIn   - Standing height in inches, used to compute height² for ALMI → kg conversion.
 * @param almiTarget - Appendicular lean mass index (kg/m²) for this scan.
 * @param boneMassKg - Bone mineral content in kg (default: 2.75); subtracted before lean is distributed.
 * @returns An object with 10 region-specific mass fields (kg, rounded to 2 dp) ready to spread into a ScanRow.
 */
function bodyComp(
  weightLb: number,
  tbfPct: number,
  heightIn: number,
  almiTarget: number,
  boneMassKg = 2.75,
) {
  const weightKg = weightLb / 2.205;
  const fatKg = r(weightKg * (tbfPct / 100));
  const leanKg = r(weightKg - fatKg - boneMassKg);

  const heightM = heightIn * 0.0254;
  const appendicularLean = r(almiTarget * heightM * heightM);

  // Arms ≈ 37 % of appendicular lean, legs ≈ 63 %
  const lArmLean = r(appendicularLean * 0.183);
  const rArmLean = r(appendicularLean * 0.187);
  const lLegLean = r(appendicularLean * 0.313);
  const rLegLean = r(appendicularLean * 0.317);
  const trunkLean = r(leanKg - appendicularLean);

  const lArmFat = r(fatKg * 0.08);
  const rArmFat = r(fatKg * 0.08);
  const trunkFat = r(fatKg * 0.50);
  const lLegFat = r(fatKg * 0.17);
  const rLegFat = r(fatKg * 0.17);

  const kgToLb = (kg: number) => r(kg * 2.205);

  return {
    total_lean_mass: kgToLb(leanKg),
    total_fat_mass: kgToLb(fatKg),
    l_arm_lean_mass: kgToLb(lArmLean),
    r_arm_lean_mass: kgToLb(rArmLean),
    trunk_lean_mass: kgToLb(trunkLean),
    l_leg_lean_mass: kgToLb(lLegLean),
    r_leg_lean_mass: kgToLb(rLegLean),
    l_arm_fat_mass: kgToLb(lArmFat),
    r_arm_fat_mass: kgToLb(rArmFat),
    trunk_fat_mass: kgToLb(trunkFat),
    l_leg_fat_mass: kgToLb(lLegFat),
    r_leg_fat_mass: kgToLb(rLegFat),
  };
}

/**
 * Builds a complete ScanRow object ready to insert into the `scans` table.
 * Generates a fresh UUID for `id`, constructs a deterministic `external_scan_id`
 * from the member slug and scan index, and calls `bodyComp` to populate all
 * per-region mass fields.
 *
 * @param memberId      - UUID of the owning member (auth user id).
 * @param scanIdx       - Zero-based position of this scan in the member's scan list; used to form the external_scan_id.
 * @param nameSlug      - Short lowercase name used in the external_scan_id (e.g. "sarah").
 * @param scanDate      - ISO date string for the scan (YYYY-MM-DD).
 * @param weightLb      - Total body weight in pounds.
 * @param tbfPct        - Total body fat percentage.
 * @param vatAreaCm2    - Visceral adipose tissue area in cm².
 * @param almi          - Appendicular lean mass index (kg/m²).
 * @param heightIn      - Standing height in inches.
 * @param bmd           - Total bone mineral density (g/cm²).
 * @param tScore        - T-score relative to young-normal reference population.
 * @param zScore        - Z-score relative to age-matched reference population.
 * @param tbfPctileYn   - TBF% percentile vs. young-normal norms.
 * @param tbfPctileAm   - TBF% percentile vs. age-matched norms.
 * @param almiPctileYn  - ALMI percentile vs. young-normal norms.
 * @param almiPctileAm  - ALMI percentile vs. age-matched norms.
 * @param boneMassKg    - Bone mineral content in kg (default: 2.75).
 * @returns A fully-populated ScanRow object (without `created_at`, which the DB defaults).
 */
function makeScan(
  memberId: string,
  scanIdx: number,
  nameSlug: string,
  scanDate: string,
  weightLb: number,
  tbfPct: number,
  vatAreaCm2: number,
  almi: number,
  heightIn: number,
  bmd: number,
  tScore: number,
  zScore: number,
  tbfPctileYn: number,
  tbfPctileAm: number,
  almiPctileYn: number,
  almiPctileAm: number,
  boneMassKg = 2.75,
) {
  return {
    id: crypto.randomUUID(),
    member_id: memberId,
    scan_date: scanDate,
    external_scan_id: `SEED-${nameSlug.toUpperCase()}-${String(scanIdx + 1).padStart(3, "0")}`,
    device_model: "Hologic Horizon A",
    device_serial: "S/N-DEMO-001",
    software_version: "APEX 6.0",
    weight_lb: weightLb,
    height_in: heightIn,
    tbf_pct: tbfPct,
    tbf_pct_pctile_yn: tbfPctileYn,
    tbf_pct_pctile_am: tbfPctileAm,
    vat_area_cm2: vatAreaCm2,
    almi,
    almi_pctile_yn: almiPctileYn,
    almi_pctile_am: almiPctileAm,
    total_bmd: bmd,
    total_t_score: tScore,
    total_z_score: zScore,
    source_pdf_path: null,
    ...bodyComp(weightLb, tbfPct, heightIn, almi, boneMassKg),
  };
}

// ---------------------------------------------------------------------------
// Demo members
// ---------------------------------------------------------------------------

const MEMBERS = [
  // ── Sarah ─────────────────────────────────────────────────────────────────
  // Persona: first-scan only (recent).  Female, early 30s.
  {
    email: "sarah@demo.kalos.dev",
    password: "password123",
    meta: { name: "Sarah Demo", dob: "1993-04-15", sex: "female" },
    nameSlug: "sarah",
    heightIn: 65,
    boneMassKg: 2.4,
    bmd: 1.18,
    tScore: -0.3,
    zScore: 0.4,
    scans: [
      // 1 scan — tests first-scan UI
      {
        scan_date: "2026-03-15",
        weight_lb: 142,
        tbf_pct: 29.2,
        vat_area_cm2: 58,
        almi: 6.8,
        tbf_pct_pctile_yn: 48,
        tbf_pct_pctile_am: 50,
        almi_pctile_yn: 38,
        almi_pctile_am: 42,
      },
    ],
    goals: (firstScanId: string) =>
      [
        {
          metric: "tbf_pct" as const,
          direction: "decrease" as const,
          baseline_value: 29.2,
          baseline_scan_id: firstScanId,
          target_value: 24.0,
        },
      ] satisfies GoalMetric[],
  },

  // ── Jordan ────────────────────────────────────────────────────────────────
  // Persona: 2 scans, mild fat loss + lean gain.  Male, mid 20s.
  {
    email: "jordan@demo.kalos.dev",
    password: "password123",
    meta: { name: "Jordan Demo", dob: "2000-07-10", sex: "male" },
    nameSlug: "jordan",
    heightIn: 70,
    boneMassKg: 3.0,
    bmd: 1.35,
    tScore: 0.8,
    zScore: 0.9,
    scans: [
      {
        scan_date: "2026-01-10",
        weight_lb: 178,
        tbf_pct: 22.4,
        vat_area_cm2: 78,
        almi: 8.0,
        tbf_pct_pctile_yn: 62,
        tbf_pct_pctile_am: 60,
        almi_pctile_yn: 40,
        almi_pctile_am: 42,
      },
      {
        scan_date: "2026-02-10",
        weight_lb: 177,
        tbf_pct: 21.2, // −1.2 pts fat loss
        vat_area_cm2: 72,
        almi: 8.2, // lean gain
        tbf_pct_pctile_yn: 58,
        tbf_pct_pctile_am: 56,
        almi_pctile_yn: 44,
        almi_pctile_am: 46,
      },
    ],
    goals: (firstScanId: string) =>
      [
        {
          metric: "tbf_pct" as const,
          direction: "decrease" as const,
          baseline_value: 22.4,
          baseline_scan_id: firstScanId,
          target_value: 18.0,
        },
      ] satisfies GoalMetric[],
  },

  // ── Alex ──────────────────────────────────────────────────────────────────
  // Persona: 5 scans, steady cut + lean preservation.  Male, late 20s.
  {
    email: "alex@demo.kalos.dev",
    password: "password123",
    meta: { name: "Alex Demo", dob: "1997-11-20", sex: "male" },
    nameSlug: "alex",
    heightIn: 71,
    boneMassKg: 3.1,
    bmd: 1.38,
    tScore: 1.0,
    zScore: 1.0,
    scans: [
      {
        scan_date: "2025-11-20",
        weight_lb: 195,
        tbf_pct: 23.8,
        vat_area_cm2: 95,
        almi: 8.6,
        tbf_pct_pctile_yn: 68,
        tbf_pct_pctile_am: 65,
        almi_pctile_yn: 48,
        almi_pctile_am: 50,
      },
      {
        scan_date: "2025-12-20",
        weight_lb: 193,
        tbf_pct: 22.6,
        vat_area_cm2: 89,
        almi: 8.6,
        tbf_pct_pctile_yn: 64,
        tbf_pct_pctile_am: 62,
        almi_pctile_yn: 48,
        almi_pctile_am: 50,
      },
      {
        scan_date: "2026-01-20",
        weight_lb: 191,
        tbf_pct: 21.4,
        vat_area_cm2: 83,
        almi: 8.7,
        tbf_pct_pctile_yn: 60,
        tbf_pct_pctile_am: 58,
        almi_pctile_yn: 50,
        almi_pctile_am: 52,
      },
      {
        scan_date: "2026-02-20",
        weight_lb: 189,
        tbf_pct: 20.2,
        vat_area_cm2: 77,
        almi: 8.7,
        tbf_pct_pctile_yn: 56,
        tbf_pct_pctile_am: 54,
        almi_pctile_yn: 50,
        almi_pctile_am: 52,
      },
      {
        scan_date: "2026-03-20",
        weight_lb: 187,
        tbf_pct: 19.0,
        vat_area_cm2: 71,
        almi: 8.8,
        tbf_pct_pctile_yn: 52,
        tbf_pct_pctile_am: 50,
        almi_pctile_yn: 52,
        almi_pctile_am: 54,
      },
    ],
    goals: (firstScanId: string) =>
      [
        {
          metric: "tbf_pct" as const,
          direction: "decrease" as const,
          baseline_value: 23.8,
          baseline_scan_id: firstScanId,
          target_value: 15.0,
        },
        {
          metric: "almi" as const,
          direction: "maintain" as const,
          baseline_value: 8.6,
          baseline_scan_id: firstScanId,
        },
      ] satisfies GoalMetric[],
  },

  // ── Taylor ────────────────────────────────────────────────────────────────
  // Persona: 3 scans, lean mass regression in last scan.  Female, mid 30s.
  // Must surface in find_population_metric_change.
  {
    email: "taylor@demo.kalos.dev",
    password: "password123",
    meta: { name: "Taylor Demo", dob: "1990-09-05", sex: "female" },
    nameSlug: "taylor",
    heightIn: 64,
    boneMassKg: 2.3,
    bmd: 1.14,
    tScore: -0.5,
    zScore: 0.1,
    scans: [
      {
        scan_date: "2026-01-05",
        weight_lb: 156,
        tbf_pct: 31.2,
        vat_area_cm2: 80,
        almi: 6.5,
        tbf_pct_pctile_yn: 54,
        tbf_pct_pctile_am: 51,
        almi_pctile_yn: 32,
        almi_pctile_am: 36,
      },
      {
        scan_date: "2026-02-05",
        weight_lb: 157,
        tbf_pct: 31.8,
        vat_area_cm2: 83,
        almi: 6.5,
        tbf_pct_pctile_yn: 56,
        tbf_pct_pctile_am: 53,
        almi_pctile_yn: 32,
        almi_pctile_am: 36,
      },
      {
        scan_date: "2026-03-05",
        weight_lb: 158,
        tbf_pct: 32.8, // fat up + lean down → regression
        vat_area_cm2: 87,
        almi: 6.3,
        tbf_pct_pctile_yn: 58,
        tbf_pct_pctile_am: 55,
        almi_pctile_yn: 28,
        almi_pctile_am: 33,
      },
    ],
    goals: (firstScanId: string) =>
      [
        {
          metric: "tbf_pct" as const,
          direction: "decrease" as const,
          baseline_value: 31.2,
          baseline_scan_id: firstScanId,
        },
        {
          metric: "almi" as const,
          direction: "increase" as const,
          baseline_value: 6.5,
          baseline_scan_id: firstScanId,
        },
      ] satisfies GoalMetric[],
  },

  // ── Morgan ────────────────────────────────────────────────────────────────
  // Persona: 6 scans, weight-stable recomp (fat ↓, lean ↑).  Female, late 20s.
  {
    email: "morgan@demo.kalos.dev",
    password: "password123",
    meta: { name: "Morgan Demo", dob: "1996-02-28", sex: "female" },
    nameSlug: "morgan",
    heightIn: 66,
    boneMassKg: 2.5,
    bmd: 1.20,
    tScore: -0.1,
    zScore: 0.6,
    scans: [
      {
        scan_date: "2025-09-28",
        weight_lb: 148,
        tbf_pct: 30.5,
        vat_area_cm2: 72,
        almi: 6.6,
        tbf_pct_pctile_yn: 52,
        tbf_pct_pctile_am: 50,
        almi_pctile_yn: 34,
        almi_pctile_am: 38,
      },
      {
        scan_date: "2025-10-28",
        weight_lb: 148,
        tbf_pct: 29.5,
        vat_area_cm2: 68,
        almi: 6.8,
        tbf_pct_pctile_yn: 50,
        tbf_pct_pctile_am: 48,
        almi_pctile_yn: 38,
        almi_pctile_am: 41,
      },
      {
        scan_date: "2025-11-28",
        weight_lb: 148,
        tbf_pct: 28.5,
        vat_area_cm2: 64,
        almi: 7.0,
        tbf_pct_pctile_yn: 47,
        tbf_pct_pctile_am: 46,
        almi_pctile_yn: 42,
        almi_pctile_am: 44,
      },
      {
        scan_date: "2025-12-28",
        weight_lb: 148,
        tbf_pct: 27.5,
        vat_area_cm2: 60,
        almi: 7.2,
        tbf_pct_pctile_yn: 44,
        tbf_pct_pctile_am: 43,
        almi_pctile_yn: 46,
        almi_pctile_am: 48,
      },
      {
        scan_date: "2026-01-28",
        weight_lb: 148,
        tbf_pct: 26.5,
        vat_area_cm2: 56,
        almi: 7.3,
        tbf_pct_pctile_yn: 41,
        tbf_pct_pctile_am: 40,
        almi_pctile_yn: 48,
        almi_pctile_am: 50,
      },
      {
        scan_date: "2026-02-28",
        weight_lb: 148,
        tbf_pct: 25.5,
        vat_area_cm2: 52,
        almi: 7.5,
        tbf_pct_pctile_yn: 38,
        tbf_pct_pctile_am: 38,
        almi_pctile_yn: 52,
        almi_pctile_am: 53,
      },
    ],
    goals: (firstScanId: string) =>
      [
        {
          metric: "weight_lb" as const,
          direction: "maintain" as const,
          baseline_value: 148,
          baseline_scan_id: firstScanId,
          target_value: 148,
        },
      ] satisfies GoalMetric[],
  },

  // ── Casey ─────────────────────────────────────────────────────────────────
  // Persona: 4 scans, bulking phase (lean up, fat stable, weight up).  Male, early 20s.
  {
    email: "casey@demo.kalos.dev",
    password: "password123",
    meta: { name: "Casey Demo", dob: "2003-08-22", sex: "male" },
    nameSlug: "casey",
    heightIn: 69,
    boneMassKg: 2.9,
    bmd: 1.32,
    tScore: 0.5,
    zScore: 0.7,
    scans: [
      {
        scan_date: "2026-01-22",
        weight_lb: 168,
        tbf_pct: 18.5,
        vat_area_cm2: 65,
        almi: 8.3,
        tbf_pct_pctile_yn: 50,
        tbf_pct_pctile_am: 48,
        almi_pctile_yn: 48,
        almi_pctile_am: 50,
      },
      {
        scan_date: "2026-02-22",
        weight_lb: 171,
        tbf_pct: 18.6, // fat stable while gaining mass
        vat_area_cm2: 66,
        almi: 8.6,
        tbf_pct_pctile_yn: 51,
        tbf_pct_pctile_am: 49,
        almi_pctile_yn: 52,
        almi_pctile_am: 54,
      },
      {
        scan_date: "2026-03-22",
        weight_lb: 174,
        tbf_pct: 18.7,
        vat_area_cm2: 67,
        almi: 8.9,
        tbf_pct_pctile_yn: 51,
        tbf_pct_pctile_am: 50,
        almi_pctile_yn: 56,
        almi_pctile_am: 58,
      },
      {
        scan_date: "2026-04-22",
        weight_lb: 177,
        tbf_pct: 18.8,
        vat_area_cm2: 68,
        almi: 9.2,
        tbf_pct_pctile_yn: 52,
        tbf_pct_pctile_am: 50,
        almi_pctile_yn: 60,
        almi_pctile_am: 62,
      },
    ],
    goals: (firstScanId: string) =>
      [
        {
          metric: "weight_lb" as const,
          direction: "increase" as const,
          baseline_value: 168,
          baseline_scan_id: firstScanId,
          target_value: 180,
        },
        {
          metric: "almi" as const,
          direction: "increase" as const,
          baseline_value: 8.3,
          baseline_scan_id: firstScanId,
          target_value: 9.5,
        },
      ] satisfies GoalMetric[],
  },
] as const;

// ---------------------------------------------------------------------------
// Clean-up (idempotent)
// ---------------------------------------------------------------------------

/**
 * Deletes all existing seed data from the database so the script is idempotent.
 * Finds seed users by matching against the demo email addresses in MEMBERS,
 * then deletes their rows in FK-safe order: member_goals → scans → members → auth users.
 * If no seed users exist yet, the function returns early without making any deletions.
 *
 * @returns A promise that resolves when cleanup is complete.
 * @throws  The Supabase error object if any database or auth operation fails.
 */
async function cleanUp() {
  console.log("🧹  Cleaning up existing seed data…");

  const seedEmails: string[] = MEMBERS.map((m) => m.email);

  // Look up auth user IDs by email (service role can query auth schema via rpc)
  const { data: users, error: listErr } =
    await supabase.auth.admin.listUsers({ perPage: 200 });
  if (listErr) throw listErr;

  const seedUserIds = users.users
    .filter((u) => seedEmails.includes(u.email ?? ""))
    .map((u) => u.id);

  if (seedUserIds.length === 0) {
    console.log("   No existing seed users found — skipping cleanup.");
    return;
  }

  // Delete in FK-safe order
  const { error: goalsErr } = await supabase
    .from("member_goals")
    .delete()
    .in("member_id", seedUserIds);
  if (goalsErr) throw goalsErr;

  const { error: scansErr } = await supabase
    .from("scans")
    .delete()
    .in("member_id", seedUserIds);
  if (scansErr) throw scansErr;

  const { error: membersErr } = await supabase
    .from("members")
    .delete()
    .in("id", seedUserIds);
  if (membersErr) throw membersErr;

  for (const uid of seedUserIds) {
    const { error } = await supabase.auth.admin.deleteUser(uid);
    if (error) throw error;
  }

  console.log(`   Removed ${seedUserIds.length} existing seed user(s).`);
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

/**
 * Orchestrates the full seed run for all demo members.
 * Calls `cleanUp` first to ensure idempotency, then for each member in MEMBERS:
 *   1. Creates an auth user via the admin API (a DB trigger auto-creates the `members` row).
 *   2. Inserts all of the member's scans by building ScanRows with `makeScan`.
 *   3. Inserts a `member_goals` row if the member definition includes a `goals` factory.
 *
 * @returns A promise that resolves when all members, scans, and goals have been inserted.
 * @throws  The Supabase error object if any auth or database operation fails.
 */
async function seed() {
  await cleanUp();

  for (const member of MEMBERS) {
    console.log(`\n👤  Seeding ${member.meta.name} (${member.email})…`);

    // 1. Create auth user — trigger creates members row automatically
    const { data: authData, error: authErr } =
      await supabase.auth.admin.createUser({
        email: member.email,
        password: member.password,
        email_confirm: true,
        user_metadata: member.meta,
      });
    if (authErr) throw authErr;

    const memberId = authData.user.id;
    console.log(`   Auth user created: ${memberId}`);

    // 2. Insert scans
    const scanRows: ScanRow[] = (member.scans as readonly (typeof member.scans[number])[]).map(
      (s, i) =>
        makeScan(
          memberId,
          i,
          member.nameSlug,
          s.scan_date,
          s.weight_lb,
          s.tbf_pct,
          s.vat_area_cm2,
          s.almi,
          member.heightIn,
          member.bmd,
          member.tScore,
          member.zScore,
          s.tbf_pct_pctile_yn,
          s.tbf_pct_pctile_am,
          s.almi_pctile_yn,
          s.almi_pctile_am,
          member.boneMassKg,
        ),
    );

    const { error: scansErr } = await supabase.from("scans").insert(scanRows);
    if (scansErr) throw scansErr;
    console.log(`   ${scanRows.length} scan(s) inserted.`);

    // 3. Insert goals (members 2–6 per issue spec; goals fn present = insert)
    if (member.goals) {
      const firstScanId = scanRows[0].id!;
      const metrics = member.goals(firstScanId);

      const { error: goalsErr } = await supabase.from("member_goals").insert({
        member_id: memberId,
        metrics,
      });
      if (goalsErr) throw goalsErr;
      console.log(`   Goals inserted (${metrics.length} metric(s)).`);
    }
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

(async () => {
  try {
    await seed();
    console.log("\n✅  Seed complete.");
    process.exit(0);
  } catch (err: unknown) {
    console.error("\n❌  Seed failed:", err);
    process.exit(1);
  }
})();
