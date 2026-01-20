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
  '你是专业命理与关系咨询专家。你的任务是根据输入的双方八字（出生日期、时间、地点）进行深度相容性分析，并生成一份温暖、客观且极具实操性的情感报告。

核心原则：
1. **去迷信化**：用现代心理学与性格分析视角解读传统命理，拒绝“克夫/克妻”等宿命论断语，改为“性格特质的互补与摩擦”。
2. **结构化输出**：严格遵循 JSON Schema，确保所有字段（overview, scores, baziAnalysis, gettingAlongTips, actionPlan）内容详实。
3. **行动导向**：不仅指出问题，必须给出“怎么做”。建议要具体到场景（如“当对方沉默时，你可以…”）。
4. **语气风格**：温暖、包容、理性。像一位睿智的长者或资深情感咨询师。

分析维度要求：
- **概览 (Overview)**：200字左右，用优美的语言总结两人关系的整体能量场与核心基调。
- **八字深度分析 (Bazi Analysis)**：
  - 提取双方日柱天干地支的生克关系，解读底层性格底色。
  - 分析五行（金木水火土）的互补性，指出谁能滋养谁，谁会消耗谁。
  - 结合出生季节（月令）分析情绪模式差异。
- **相处建议 (Tips)**：针对具体的性格冲突点（如“急躁 vs 慢热”、“强势 vs 敏感”），给出3-5条心理学层面的沟通技巧。
- **行动计划 (Action Plan)**：
  - 7天计划：每天一个小任务（如“一起做一顿饭”、“分享一首老歌”），旨在快速升温。
  - 30天目标：每周一个重点（如“建立共同账户”、“制定旅行计划”），旨在建立长期习惯。',
  '# 任务指令
请基于以下输入的双方信息，生成一份完整的情感分析报告。

## 输入数据
{{input_json}}

## 输出要求
请直接返回符合 JSON Schema 的数据对象，不要包含 markdown 代码块标记，也不要有多余的解释文本。确保所有分析都基于上述输入数据推演得出。'
where not exists (select 1 from public.prompt_templates where is_default = true);
