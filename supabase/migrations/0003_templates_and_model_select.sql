alter table public.couple_reports
add column if not exists template_id uuid;

drop policy if exists templates_select_all on public.prompt_templates;
create policy templates_select_all on public.prompt_templates
for select to authenticated
using (true);

grant select on public.prompt_templates to authenticated;
