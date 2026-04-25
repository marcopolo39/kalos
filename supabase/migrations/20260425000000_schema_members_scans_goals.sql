-- =============================================================================
-- MAR-31: Database schema — members, scans (flat), member_goals
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. members
-- ---------------------------------------------------------------------------
create table public.members (
  id         uuid        not null references auth.users (id) on delete cascade,
  name       text        not null,
  dob        date        not null,
  sex        text        not null,
  created_at timestamptz not null default now(),

  constraint members_pkey primary key (id)
);

alter table public.members enable row level security;

create policy "members: select own row"
  on public.members for select
  using (id = auth.uid());

create policy "members: insert own row"
  on public.members for insert
  with check (id = auth.uid());

create policy "members: update own row"
  on public.members for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "members: delete own row"
  on public.members for delete
  using (id = auth.uid());

-- ---------------------------------------------------------------------------
-- 2. scans (wide flat, ~28 columns)
-- ---------------------------------------------------------------------------
create table public.scans (
  -- identity
  id               uuid        not null default gen_random_uuid(),
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
  weight_lb  numeric,
  height_in  numeric,

  -- scan-level composition
  tbf_pct         numeric,  -- total body fat %
  tbf_pct_pctile_yn numeric, -- Young Normal percentile
  tbf_pct_pctile_am numeric, -- Age Matched percentile
  vat_area_cm2    numeric,  -- visceral adipose tissue area
  almi            numeric,  -- appendicular lean mass index
  almi_pctile_yn  numeric,
  almi_pctile_am  numeric,

  -- bone density (scan-level only)
  total_bmd     numeric,
  total_t_score numeric,
  total_z_score numeric,

  -- per-region mass (5 regions × 2 metrics = 10 cols)
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

  constraint scans_pkey primary key (id),
  constraint scans_unique_upload unique (member_id, scan_date, external_scan_id)
);

-- Covers "latest scan per member" and per-member scan history queries
create index scans_member_id_scan_date_idx on public.scans (member_id, scan_date desc);

alter table public.scans enable row level security;

create policy "scans: select own"
  on public.scans for select
  using (member_id = auth.uid());

create policy "scans: insert own"
  on public.scans for insert
  with check (member_id = auth.uid());

create policy "scans: update own"
  on public.scans for update
  using (member_id = auth.uid())
  with check (member_id = auth.uid());

create policy "scans: delete own"
  on public.scans for delete
  using (member_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 3. member_goals (JSONB metrics array)
-- ---------------------------------------------------------------------------
-- metrics shape: [{ metric, direction, baseline_value, baseline_scan_id, target_value? }, ...]
-- Valid metric values:  tbf_pct | almi | vat_area_cm2 | weight_lb
-- Valid direction values: decrease | increase | maintain
-- target_value is optional. When present, dashboard renders progress as
--   (baseline_value − current) / (baseline_value − target_value), clamped 0–100%.
--   When absent, renders direction-only ("body fat trending down 1.2pp from baseline").
-- Shape validated in the application layer (Zod); not enforced by Postgres.
-- No FK on baseline_scan_id — typo'd ID surfaces immediately as a render error.
create table public.member_goals (
  id        uuid not null default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  metrics   jsonb not null default '[]'::jsonb,

  constraint member_goals_pkey primary key (id)
);

create index member_goals_member_id_idx on public.member_goals (member_id);

alter table public.member_goals enable row level security;

create policy "member_goals: select own"
  on public.member_goals for select
  using (member_id = auth.uid());

create policy "member_goals: insert own"
  on public.member_goals for insert
  with check (member_id = auth.uid());

create policy "member_goals: update own"
  on public.member_goals for update
  using (member_id = auth.uid())
  with check (member_id = auth.uid());

create policy "member_goals: delete own"
  on public.member_goals for delete
  using (member_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 4. Trigger: auto-create members row on auth.users INSERT
-- ---------------------------------------------------------------------------
-- security definer is required so the trigger can write to public.members
-- even though it fires in the auth schema context.
-- name/dob/sex must be passed via supabase.auth.signUp({ options: { data: { name, dob, sex } } })
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.members (id, name, dob, sex)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    (new.raw_user_meta_data->>'dob')::date,
    new.raw_user_meta_data->>'sex'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 5. Storage: private "scans" bucket + RLS policies
-- ---------------------------------------------------------------------------
-- Object path convention: scans/<member_id>/<scan_id>.pdf
insert into storage.buckets (id, name, public)
  values ('scans', 'scans', false)
  on conflict (id) do nothing;

create policy "storage scans: select own folder"
  on storage.objects for select
  using (
    bucket_id = 'scans'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage scans: insert own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'scans'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage scans: update own folder"
  on storage.objects for update
  using (
    bucket_id = 'scans'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage scans: delete own folder"
  on storage.objects for delete
  using (
    bucket_id = 'scans'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
