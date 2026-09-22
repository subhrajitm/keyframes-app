-- Replace OpenRouter BYOK column with Experiential Labs
alter table public.users
  add column if not exists explabs_api_key text;

-- Existing openrouter keys are provider-specific and won't work on Experiential Labs,
-- so we just drop the old column.
alter table public.users
  drop column if exists openrouter_api_key;
