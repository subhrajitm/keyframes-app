-- Allow projects to be made publicly visible
alter table public.projects
  add column if not exists is_public boolean not null default false;

create index if not exists idx_projects_is_public on public.projects (is_public, updated_at desc);
