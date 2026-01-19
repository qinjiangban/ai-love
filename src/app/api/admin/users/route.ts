import { NextResponse } from 'next/server'
import { z } from 'zod'

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
    .from('profiles')
    .select('id,email,role,created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: '加载失败' }, { status: 500 })
  return NextResponse.json({ users: data ?? [] })
}

const patchSchema = z.object({ id: z.string().uuid(), role: z.enum(['user', 'admin']) })

export async function PATCH(request: Request) {
  const admin = await requireAdminProfile()
  if (!admin) return NextResponse.json({ error: '无权限' }, { status: 403 })

  const json = await request.json().catch(() => null)
  const parsed = patchSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: '参数不正确' }, { status: 400 })

  let supabase: ReturnType<typeof getSupabaseAdminClient>
  try {
    supabase = getSupabaseAdminClient()
  } catch (e) {
    const msg = e instanceof Error ? e.message : '未配置 SUPABASE_SERVICE_ROLE_KEY'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
  const { error } = await supabase
    .from('profiles')
    .update({ role: parsed.data.role })
    .eq('id', parsed.data.id)

  if (error) return NextResponse.json({ error: '保存失败' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
