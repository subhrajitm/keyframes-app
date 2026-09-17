-- Scenes: ordered narrative groups within a project
create table public.scenes (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  order_index integer not null default 0,
  title text not null default 'Scene',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Shots: individual AI generation units within a scene
create table public.shots (
  id uuid primary key default uuid_generate_v4(),
  scene_id uuid not null references public.scenes(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  order_index integer not null default 0,
  title text not null default 'Shot',
  shot_spec jsonb not null default '{}',
  node_id text,
  status text not null default 'idle' check (
    status in ('idle', 'image_pending', 'image_processing', 'video_pending', 'video_processing', 'completed', 'failed')
  ),
  image_url text,
  video_url text,
  error text,
  trigger_run_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Link existing generations to shots
alter table public.generations
  add column if not exists shot_id uuid references public.shots(id) on delete set null;

-- Indexes
create index scenes_project_id_idx on public.scenes(project_id);
create index shots_scene_id_idx on public.shots(scene_id);
create index shots_project_id_idx on public.shots(project_id);

-- Auto-update updated_at
create trigger scenes_updated_at before update on public.scenes
  for each row execute function update_updated_at();

create trigger shots_updated_at before update on public.shots
  for each row execute function update_updated_at();

-- RLS
alter table public.scenes enable row level security;
alter table public.shots enable row level security;

create policy "scenes: own project" on public.scenes
  for all using (
    project_id in (select id from public.projects where user_id = auth.uid())
  );

create policy "shots: own project" on public.shots
  for all using (
    project_id in (select id from public.projects where user_id = auth.uid())
  );
