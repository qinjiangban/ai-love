import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getSupabaseServerClient } from '@/lib/supabase/server'

const bodySchema = z.object({
  bucket: z.enum(['days7', 'days30']),
  index: z.number().int().min(0).max(2000),
  checked: z.boolean(),
})

type ActionPlanState = { days7: boolean[]; days30: boolean[] }

function getCounts(result: unknown) {
  const actionPlan = (result as any)?.actionPlan
  const days7 = Array.isArray(actionPlan?.days7) ? actionPlan.days7 : []
  const days30 = Array.isArray(actionPlan?.days30) ? actionPlan.days30 : []
  const total7 = days7.reduce((acc: number, d: any) => acc + (Array.isArray(d?.tasks) ? d.tasks.length : 0), 0)
  const total30 = days30.reduce((acc: number, w: any) => acc + (Array.isArray(w?.goals) ? w.goals.length : 0), 0)
  return { total7, total30 }
}

function normalizeState(state: unknown): ActionPlanState {
  const s = (state ?? {}) as any
  const days7 = Array.isArray(s.days7) ? s.days7.map(Boolean) : []
  const days30 = Array.isArray(s.days30) ? s.days30.map(Boolean) : []
  return { days7, days30 }
}

function ensureLength(arr: boolean[], len: number) {
  if (arr.length >= len) return arr
  return [...arr, ...new Array(len - arr.length).fill(false)]
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const json = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: '参数不正确' }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const reportRes = await supabase
    .from('couple_reports')
    .select('id,status,result,action_plan_state')
    .eq('id', id)
    .maybeSingle()

  if (reportRes.error || !reportRes.data) {
    return NextResponse.json({ error: '未找到报告' }, { status: 404 })
  }

  if (reportRes.data.status !== 'succeeded' || !reportRes.data.result) {
    return NextResponse.json({ error: '报告尚未生成完成' }, { status: 400 })
  }

  const { total7, total30 } = getCounts(reportRes.data.result)
  const bucketTotal = parsed.data.bucket === 'days7' ? total7 : total30
  if (parsed.data.index >= bucketTotal) {
    return NextResponse.json({ error: '索引超出范围' }, { status: 400 })
  }

  const current = normalizeState(reportRes.data.action_plan_state)
  const next: ActionPlanState = {
    days7: ensureLength(current.days7, total7),
    days30: ensureLength(current.days30, total30),
  }
  const arr = parsed.data.bucket === 'days7' ? next.days7 : next.days30
  arr[parsed.data.index] = parsed.data.checked

  const updated = await supabase
    .from('couple_reports')
    .update({ action_plan_state: next })
    .eq('id', id)
    .select('action_plan_state')
    .single()

  if (updated.error) {
    return NextResponse.json({ error: '保存失败' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, action_plan_state: updated.data.action_plan_state })
}

