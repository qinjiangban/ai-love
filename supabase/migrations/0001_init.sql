create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key,
  email text not null,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.couple_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  status text not null check (status in ('queued','generating','succeeded','failed')),
  input jsonb not null,
  result jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_couple_reports_user_id_created_at on public.couple_reports (user_id, created_at desc);

create table if not exists public.prompt_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_default boolean not null default false,
  model text not null,
  system_prompt text not null,
  user_prompt_template text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_prompt_templates_is_default on public.prompt_templates (is_default);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_couple_reports on public.couple_reports;
create trigger set_updated_at_couple_reports
before update on public.couple_reports
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_prompt_templates on public.prompt_templates;
create trigger set_updated_at_prompt_templates
before update on public.prompt_templates
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.couple_reports enable row level security;
alter table public.prompt_templates enable row level security;

drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
for select to authenticated
using (id = auth.uid());

drop policy if exists profiles_self_insert on public.profiles;
create policy profiles_self_insert on public.profiles
for insert to authenticated
with check (id = auth.uid());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists reports_self_select on public.couple_reports;
create policy reports_self_select on public.couple_reports
for select to authenticated
using (user_id = auth.uid());

drop policy if exists reports_self_insert on public.couple_reports;
create policy reports_self_insert on public.couple_reports
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists reports_self_update on public.couple_reports;
create policy reports_self_update on public.couple_reports
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists templates_default_select on public.prompt_templates;
create policy templates_default_select on public.prompt_templates
for select to authenticated
using (is_default = true);

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.couple_reports to authenticated;
grant select on public.prompt_templates to authenticated;

insert into public.prompt_templates (name, is_default, model, system_prompt, user_prompt_template)
select
  '默认模板',
  true,
  'openai/gpt-5',
  '你是专业命理与关系咨询助手。你将基于输入的两人出生信息，给出结构化的两人八字适配分析，并提供可执行的相处建议与行动计划。避免迷信式绝对断言，提供温和且可验证的建议。输出必须严格符合给定 schema。',
  '请基于以下输入生成：\n{{input_json}}'
where not exists (select 1 from public.prompt_templates where is_default = true);
