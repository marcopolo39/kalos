alter table public.scans
  add column total_lean_mass numeric, -- total body lean mass (lb), as reported by DEXA
  add column total_fat_mass  numeric; -- total body fat mass (lb), as reported by DEXA
