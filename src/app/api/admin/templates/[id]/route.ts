import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdminProfile } from '@/app/api/admin/_shared'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

const bodySchema = z.object({
  name: z.string().min(1).max(40).optional(),
  is_default: z.boolean().optional(),
  model: z.string().min(3).max(60).optional(),
  system_prompt: z.string().min(10).optional(),
  user_prompt_template: z.string().min(10).optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminProfile()
  if (!admin) return NextResponse.json({ error: '无权限' }, { status: 403 })

  const { id } = await params
  const json = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: '参数不正确' }, { status: 400 })

  let supabase: ReturnType<typeof getSupabaseAdminClient>
  try {
    supabase = getSupabaseAdminClient()
  } catch (e) {
    const msg = e instanceof Error ? e.message : '未配置 SUPABASE_SERVICE_ROLE_KEY'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  if (parsed.data.is_default === true) {
    const reset = await supabase
      .from('prompt_templates')
      .update({ is_default: false })
      .neq('id', id)
    if (reset.error) return NextResponse.json({ error: '保存失败' }, { status: 500 })
  }

  const { error } = await supabase
    .from('prompt_templates')
    .update(parsed.data)
    .eq('id', id)

  if (error) return NextResponse.json({ error: '保存失败' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
