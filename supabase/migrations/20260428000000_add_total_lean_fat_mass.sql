alter table public.scans
  add column total_lean_mass numeric, -- total body lean mass (kg), as reported by DEXA
  add column total_fat_mass  numeric; -- total body fat mass (kg), as reported by DEXA
