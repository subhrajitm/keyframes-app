-- Store multiple generated image variations per shot
alter table public.shots
  add column if not exists variation_urls text[] not null default '{}';
