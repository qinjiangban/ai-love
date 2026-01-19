import { NextResponse } from 'next/server'
import { z } from 'zod'

import { generateCoupleReport } from '@/lib/ai/generate-couple-report'
import { getMyProfile } from '@/lib/auth'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { coupleInputSchema } from '@/lib/validation'

const bodySchema = z.object({ input: coupleInputSchema })

export async function POST(request: Request) {
  const json = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: '输入不合法，请检查出生日期与时间格式' }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const profile = await getMyProfile()
  if (!profile) {
    return NextResponse.json({ error: '登录状态异常' }, { status: 401 })
  }

  const created = await supabase
    .from('couple_reports')
    .insert({
      user_id: userData.user.id,
      status: 'generating',
      input: parsed.data.input,
    })
    .select('id')
    .single()

  if (created.error) {
    return NextResponse.json({ error: '创建报告失败' }, { status: 500 })
  }

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
      .eq('id', created.data.id)
    return NextResponse.json({ id: created.data.id })
  }

  try {
    const result = await generateCoupleReport({ input: parsed.data.input, template })
    await supabase
      .from('couple_reports')
      .update({ status: 'succeeded', result, error_message: null })
      .eq('id', created.data.id)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '生成失败'
    await supabase
      .from('couple_reports')
      .update({ status: 'failed', error_message: message.slice(0, 240) })
      .eq('id', created.data.id)
  }

  return NextResponse.json({ id: created.data.id })
}
