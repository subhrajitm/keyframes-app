-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users (mirrors auth.users with extra fields)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null unique,
  full_name text,
  avatar_url text,
  credits integer not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Projects
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null default 'Untitled Project',
  description text,
  thumbnail_url text,
  graph_state jsonb,
  status text not null default 'draft' check (status in ('draft', 'generating', 'complete')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Assets (characters, locations, images, videos)
create table public.assets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  type text not null check (type in ('character', 'location', 'image', 'video', 'audio')),
  name text not null,
  url text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Generation jobs
create table public.generations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  node_id text not null,
  type text not null check (type in ('image', 'video')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  prompt text not null,
  input_asset_ids uuid[] not null default '{}',
  output_url text,
  error text,
  credits_used integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Community templates
create table public.templates (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  category text not null,
  thumbnail_url text,
  graph_snapshot jsonb not null,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at before update on public.users
  for each row execute function update_updated_at();

create trigger projects_updated_at before update on public.projects
  for each row execute function update_updated_at();

create trigger generations_updated_at before update on public.generations
  for each row execute function update_updated_at();

-- Auto-create user profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- RLS policies
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.assets enable row level security;
alter table public.generations enable row level security;
alter table public.templates enable row level security;

-- Users: can only read/update own row
create policy "users: own row" on public.users
  for all using (auth.uid() = id);

-- Projects: full CRUD on own projects
create policy "projects: own" on public.projects
  for all using (auth.uid() = user_id);

-- Assets: full CRUD on own assets
create policy "assets: own" on public.assets
  for all using (auth.uid() = user_id);

-- Generations: full CRUD on own generations
create policy "generations: own" on public.generations
  for all using (auth.uid() = user_id);

-- Templates: anyone can read, only service role can write
create policy "templates: read all" on public.templates
  for select using (true);
