create or replace function increment_credits(uid uuid, amount integer)
returns void
language plpgsql
security definer
as $$
begin
  update public.users set credits = credits + amount where id = uid;
end;
$$;
