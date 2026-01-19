alter table public.couple_reports
add column if not exists model text;

alter table public.couple_reports
add column if not exists action_plan_state jsonb not null default '{"days7": [], "days30": []}'::jsonb;

