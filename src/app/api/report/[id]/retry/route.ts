import { NextRequest, NextResponse } from 'next/server'

import { generateCoupleReport } from '@/lib/ai/generate-couple-report'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const reportRes = await supabase
    .from('couple_reports')
    .select('id,status,input')
    .eq('id', id)
    .maybeSingle()

  if (reportRes.error || !reportRes.data) {
    return NextResponse.json({ error: '未找到报告' }, { status: 404 })
  }

  await supabase
    .from('couple_reports')
    .update({ status: 'generating', error_message: null })
    .eq('id', id)

  const templateRes = await supabase
    .from('prompt_templates')
    .select('model,system_prompt,user_prompt_template')
    .eq('is_default', true)
    .maybeSingle()

  const template = templateRes.data
  if (!template) {
    await supabase
      .from('couple_reports')
      .update({ status: 'failed', error_message: '未配置默认模板' })
      .eq('id', id)
    return NextResponse.json({ ok: true })
  }

  try {
    const result = await generateCoupleReport({ input: reportRes.data.input, template })

    const total7 = result.actionPlan.days7.reduce((acc, d) => acc + d.tasks.length, 0)
    const total30 = result.actionPlan.days30.reduce((acc, w) => acc + w.goals.length, 0)
    const action_plan_state = {
      days7: new Array(total7).fill(false),
      days30: new Array(total30).fill(false),
    }

    await supabase
      .from('couple_reports')
      .update({ status: 'succeeded', result, model: template.model, action_plan_state, error_message: null })
      .eq('id', id)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '生成失败'
    await supabase
      .from('couple_reports')
      .update({ status: 'failed', model: template.model, error_message: message.slice(0, 240) })
      .eq('id', id)
  }

  return NextResponse.json({ ok: true })
}
