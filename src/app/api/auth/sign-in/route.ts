import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getSupabaseServerClient } from '@/lib/supabase/server'

const bodySchema = z.object({ email: z.string().email(), password: z.string().min(8).max(72) })

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: '邮箱或密码格式不正确（密码至少 8 位）' }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    const raw = typeof error.message === 'string' ? error.message : ''
    const msg = raw ? `登录失败：${raw}` : '登录失败'
    return NextResponse.json({ error: msg }, { status: error.status ?? 400 })
  }

  return NextResponse.json({ ok: true })
}

