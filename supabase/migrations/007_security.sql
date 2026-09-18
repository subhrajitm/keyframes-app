-- Atomic credit deduction using auth.uid() — eliminates check-then-deduct race condition.
-- Returns true on success, false if user has insufficient credits.
create or replace function deduct_credits(amount integer)
returns boolean
language plpgsql security definer as $$
declare
  rows_updated integer;
begin
  if amount <= 0 or auth.uid() is null then
    return false;
  end if;

  update public.users
  set credits = credits - amount
  where id = auth.uid() and credits >= amount;

  get diagnostics rows_updated = row_count;
  return rows_updated > 0;
end;
$$;

grant execute on function deduct_credits(integer) to authenticated;
revoke execute on function deduct_credits(integer) from anon;

-- Lock increment_credits to service_role only — prevents users from calling it directly
-- via the client SDK to top up their own balance.
revoke execute on function increment_credits(uuid, integer) from public;
revoke execute on function increment_credits(uuid, integer) from authenticated;
revoke execute on function increment_credits(uuid, integer) from anon;
grant execute on function increment_credits(uuid, integer) to service_role;

-- Per-user rate limit tracking. No RLS policies = direct table access blocked for all
-- roles; data is only accessible through the security definer function below.
create table if not exists public.rate_limits (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references public.users(id) on delete cascade,
  action      text        not null,
  created_at  timestamptz not null default now()
);

create index if not exists rate_limits_lookup_idx
  on public.rate_limits(user_id, action, created_at desc);

alter table public.rate_limits enable row level security;

-- Atomic rate limit check. Gets the calling user from auth.uid() so a user cannot
-- pass a different uid to bypass or exhaust another user's limit.
create or replace function check_rate_limit(
  p_action         text,
  p_max_calls      integer,
  p_window_seconds integer
) returns boolean
language plpgsql security definer as $$
declare
  p_user_id    uuid;
  recent_count integer;
begin
  p_user_id := auth.uid();
  if p_user_id is null then
    return false;
  end if;

  select count(*) into recent_count
  from public.rate_limits
  where user_id   = p_user_id
    and action    = p_action
    and created_at > now() - (p_window_seconds || ' seconds')::interval;

  if recent_count >= p_max_calls then
    return false;
  end if;

  insert into public.rate_limits(user_id, action) values(p_user_id, p_action);
  return true;
end;
$$;

grant execute on function check_rate_limit(text, integer, integer) to authenticated;
revoke execute on function check_rate_limit(text, integer, integer) from anon;

-- Maintenance helper: prune entries older than 1 day. Wire this to a pg_cron job
-- or a Trigger.dev scheduled task so the rate_limits table stays bounded.
create or replace function cleanup_rate_limits()
returns void language plpgsql security definer as $$
begin
  delete from public.rate_limits where created_at < now() - interval '1 day';
end;
$$;
