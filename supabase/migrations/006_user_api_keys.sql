-- User-supplied API keys for BYOK (bring your own key) integrations
alter table public.users
  add column if not exists fal_api_key text,
  add column if not exists openrouter_api_key text;
