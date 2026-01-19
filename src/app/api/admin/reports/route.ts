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
    .from('couple_reports')
    .select('id,user_id,status,created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: '加载失败' }, { status: 500 })
  return NextResponse.json({ reports: data ?? [] })
}
