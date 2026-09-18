-- Additional indexes for hot query paths not covered by earlier migrations.
-- shots(project_id, status) — used by bulk-generate and status polling
create index if not exists shots_project_status_idx
  on public.shots(project_id, status);

-- shots(status) — used by admin dashboards / monitoring queries
create index if not exists shots_status_idx
  on public.shots(status);

-- shots(trigger_run_id) — used to look up a shot by its Trigger.dev run ID
create index if not exists shots_trigger_run_id_idx
  on public.shots(trigger_run_id)
  where trigger_run_id is not null;

-- projects(user_id, status) — dashboard project listing with status filter
create index if not exists projects_user_status_idx
  on public.projects(user_id, status);

-- assets(user_id, project_id) — asset library queries scoped to a project
create index if not exists assets_user_project_idx
  on public.assets(user_id, project_id);
