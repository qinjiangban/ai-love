create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.couple_reports(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_report_id_created_at on public.chat_messages (report_id, created_at asc);

alter table public.chat_messages enable row level security;

-- 允许用户查看自己报告的聊天记录
create policy chat_messages_self_select on public.chat_messages
for select to authenticated
using (
  exists (
    select 1 from public.couple_reports
    where id = chat_messages.report_id
    and user_id = auth.uid()
  )
);

-- 允许用户在自己的报告下插入聊天记录
create policy chat_messages_self_insert on public.chat_messages
for insert to authenticated
with check (
  exists (
    select 1 from public.couple_reports
    where id = report_id
    and user_id = auth.uid()
  )
);
