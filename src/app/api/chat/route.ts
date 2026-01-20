import { streamText, gateway } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

import { getSupabaseServerClient } from '@/lib/supabase/server'
import { serverEnv } from '@/lib/env/server'

export async function POST(req: NextRequest) {
  const { messages, report_id } = await req.json()

  const supabase = await getSupabaseServerClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 1. 获取报告上下文
  const { data: report, error: reportError } = await supabase
    .from('couple_reports')
    .select('input, result, model, template_id')
    .eq('id', report_id)
    .eq('user_id', userData.user.id)
    .single()

  if (reportError || !report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  // 2. 获取对应的 System Prompt (如果是自定义模板)
  // 如果没有 template_id，则使用默认的系统提示词构建逻辑
  let systemPrompt =
    '你是专业命理与关系咨询专家。你的任务是根据用户的提问，结合之前的八字分析报告，提供温暖、客观且极具实操性的建议。\n\n' +
    '核心原则：\n' +
    '1. **去迷信化**：用现代心理学与性格分析视角解读传统命理。\n' +
    '2. **行动导向**：给出具体的“怎么做”。\n' +
    '3. **语气风格**：温暖、包容、理性。像一位睿智的长者或资深情感咨询师。\n'

  // 将报告的关键信息注入 System Prompt
  const reportContext = `
  【报告上下文】
  双方信息：${JSON.stringify(report.input)}
  分析概览：${JSON.stringify(report.result?.overview)}
  八字分析：${JSON.stringify(report.result?.baziAnalysis)}
  相处建议：${JSON.stringify(report.result?.gettingAlongTips)}
  `
  systemPrompt += reportContext

  void serverEnv.AI_GATEWAY_API_KEY

  // 3. 流式生成回复
  const result = streamText({
    model: gateway(report.model || 'openai/gpt-5'), // 使用生成报告时的模型，或者默认
    system: systemPrompt,
    messages,
    onFinish: async ({ text }) => {
      // 4. 持久化聊天记录 (异步)
      // 保存用户提问
      const lastUserMessage = messages[messages.length - 1]
      if (lastUserMessage && lastUserMessage.role === 'user') {
        await supabase.from('chat_messages').insert({
          report_id,
          role: 'user',
          content: lastUserMessage.content,
        })
      }
      // 保存 AI 回复
      await supabase.from('chat_messages').insert({
        report_id,
        role: 'assistant',
        content: text,
      })
    },
  })

  return result.toTextStreamResponse()
}
