-- increment_credits: used by Trigger.dev tasks to refund on failure
create or replace function public.increment_credits(uid uuid, amount integer)
returns void
language plpgsql
security definer
as $$
begin
  update public.users set credits = credits + amount where id = uid;
end;
$$;

-- Enable Supabase Realtime for live shot status updates in ScenePanel
alter publication supabase_realtime add table public.shots;
alter publication supabase_realtime add table public.scenes;

-- Storage RLS policies for assets bucket (idempotent via DO block)
do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'assets upload: own folder' and tablename = 'objects'
  ) then
    execute $p$create policy "assets upload: own folder" on storage.objects
      for insert with check (
        bucket_id = 'assets' and
        auth.uid()::text = (string_to_array(name, '/'))[1]
      )$p$;
  end if;

  if not exists (
    select 1 from pg_policies where policyname = 'assets read: public' and tablename = 'objects'
  ) then
    execute $p$create policy "assets read: public" on storage.objects
      for select using (bucket_id = 'assets')$p$;
  end if;

  if not exists (
    select 1 from pg_policies where policyname = 'assets delete: own folder' and tablename = 'objects'
  ) then
    execute $p$create policy "assets delete: own folder" on storage.objects
      for delete using (
        bucket_id = 'assets' and
        auth.uid()::text = (string_to_array(name, '/'))[1]
      )$p$;
  end if;
end $$;

-- Storage RLS policies for videos bucket
do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'videos read: public' and tablename = 'objects'
  ) then
    execute $p$create policy "videos read: public" on storage.objects
      for select using (bucket_id = 'videos')$p$;
  end if;

  if not exists (
    select 1 from pg_policies where policyname = 'videos upload: service role' and tablename = 'objects'
  ) then
    execute $p$create policy "videos upload: service role" on storage.objects
      for insert with check (bucket_id = 'videos')$p$;
  end if;
end $$;
