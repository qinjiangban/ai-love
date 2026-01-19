import { NextResponse } from 'next/server'

import { requireAdminProfile } from '@/app/api/admin/_shared'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const admin = await requireAdminProfile()
  if (!admin) return NextResponse.json({ error: '无权限' }, { status: 403 })

  let supabase: ReturnType<typeof getSupabaseAdminClient>
  try {
    supabase = getSupabaseAdminClient()
  } catch (e) {
    const msg = e instanceof Error ? e.message : '未配置 SUPABASE_SERVICE_ROLE_KEY'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
  const { data, error } = await supabase
    .from('prompt_templates')
    .select('id,name,is_default,model,system_prompt,user_prompt_template,updated_at')
    .order('updated_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: '加载失败' }, { status: 500 })
  return NextResponse.json({ templates: data ?? [] })
}
