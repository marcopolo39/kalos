-- ============================================================
-- Table: members
-- PK doubles as FK to auth.users so RLS predicate is id = auth.uid().
-- Trigger handle_new_user() (below) auto-creates this row on signup.
-- ============================================================
create table public.members (
  id         uuid        primary key references auth.users (id) on delete cascade,
  name       text        not null,
  dob        date        not null,
  sex        text        not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Table: scans
-- Wide flat table. UNIQUE on (member_id, scan_date, external_scan_id)
-- prevents double-uploads. No scan_type discriminator — Kalos is
-- whole-body-only.
-- ============================================================
create table public.scans (
  -- identity
  id               uuid        primary key default gen_random_uuid(),
  member_id        uuid        not null references public.members (id) on delete cascade,
  scan_date        date        not null,
  external_scan_id text        not null,
  source_pdf_path  text,
  created_at       timestamptz not null default now(),

  -- device provenance
  device_model     text,
  device_serial    text,
  software_version text,

  -- anthropometric
  weight_lb numeric,
  height_in numeric,

  -- scan-level body composition
  tbf_pct          numeric, -- total body fat %
  tbf_pct_pctile_yn numeric, -- Young Normal percentile
  tbf_pct_pctile_am numeric, -- Age Matched percentile
  vat_area_cm2     numeric, -- visceral adipose tissue area
  almi             numeric, -- appendicular lean mass index
  almi_pctile_yn   numeric,
  almi_pctile_am   numeric,

  -- bone density (scan-level only; per-region asymmetry not actionable)
  total_bmd     numeric,
  total_t_score numeric,
  total_z_score numeric,

  -- per-region mass (5 regions × 2 metrics)
  l_arm_lean_mass  numeric,
  l_arm_fat_mass   numeric,
  r_arm_lean_mass  numeric,
  r_arm_fat_mass   numeric,
  trunk_lean_mass  numeric,
  trunk_fat_mass   numeric,
  l_leg_lean_mass  numeric,
  l_leg_fat_mass   numeric,
  r_leg_lean_mass  numeric,
  r_leg_fat_mass   numeric,

  unique (member_id, scan_date, external_scan_id)
);

create index idx_scans_member_scan_date on public.scans (member_id, scan_date desc);

-- ============================================================
-- Table: member_goals
-- JSONB metrics array validated in app layer (Zod), not Postgres.
-- No FK on baseline_scan_id — validated in app code.
-- ============================================================
create table public.member_goals (
  id        uuid    primary key default gen_random_uuid(),
  member_id uuid    not null references public.members (id) on delete cascade,
  metrics   jsonb   not null
);

comment on column public.member_goals.metrics is
  'Array of { metric, direction, baseline_value, baseline_scan_id }. Valid metrics: tbf_pct | almi | vat_area_cm2 | weight_lb. Valid directions: decrease | increase | maintain.';

create index idx_member_goals_member_id on public.member_goals (member_id);

-- ============================================================
-- Trigger: handle_new_user
-- Runs as SECURITY DEFINER so it can insert into public.members
-- during signup before auth.uid() is reliably set.
-- Fails loudly if name/dob/sex are missing — intentional.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.members (id, name, dob, sex)
  values (
    new.id,
    (new.raw_user_meta_data ->> 'name'),
    (new.raw_user_meta_data ->> 'dob')::date,
    (new.raw_user_meta_data ->> 'sex')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Row-Level Security
-- Owner-only model: member session reads/writes only their own rows.
-- auth.uid() wrapped in (select ...) to avoid per-row re-evaluation.
-- ============================================================
alter table public.members      enable row level security;
alter table public.scans        enable row level security;
alter table public.member_goals enable row level security;

-- members (PK is the user ID)
create policy "members_select" on public.members
  for select using (id = (select auth.uid()));
create policy "members_insert" on public.members
  for insert with check (id = (select auth.uid()));
create policy "members_update" on public.members
  for update using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "members_delete" on public.members
  for delete using (id = (select auth.uid()));

-- scans
create policy "scans_select" on public.scans
  for select using (member_id = (select auth.uid()));
create policy "scans_insert" on public.scans
  for insert with check (member_id = (select auth.uid()));
create policy "scans_update" on public.scans
  for update using (member_id = (select auth.uid())) with check (member_id = (select auth.uid()));
create policy "scans_delete" on public.scans
  for delete using (member_id = (select auth.uid()));

-- member_goals
create policy "member_goals_select" on public.member_goals
  for select using (member_id = (select auth.uid()));
create policy "member_goals_insert" on public.member_goals
  for insert with check (member_id = (select auth.uid()));
create policy "member_goals_update" on public.member_goals
  for update using (member_id = (select auth.uid())) with check (member_id = (select auth.uid()));
create policy "member_goals_delete" on public.member_goals
  for delete using (member_id = (select auth.uid()));

-- ============================================================
-- Storage: scans bucket (private)
-- Paths: scans/<member_id>/<scan_id>.pdf
-- Policies key off the first folder segment = member's UUID.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('scans', 'scans', false)
on conflict (id) do nothing;

create policy "scans_storage_select" on storage.objects
  for select using (
    bucket_id = 'scans'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "scans_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'scans'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "scans_storage_update" on storage.objects
  for update using (
    bucket_id = 'scans'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  ) with check (
    bucket_id = 'scans'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "scans_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'scans'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
