import { NextRequest, NextResponse } from 'next/server'

import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 检查报告归属权
  const { data: report, error: reportError } = await supabase
    .from('couple_reports')
    .select('id')
    .eq('id', id)
    .eq('user_id', userData.user.id)
    .single()

  if (reportError || !report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  // 获取聊天记录
  const { data: messages, error: messagesError } = await supabase
    .from('chat_messages')
    .select('id, role, content, created_at')
    .eq('report_id', id)
    .order('created_at', { ascending: true })

  if (messagesError) {
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 })
  }

  return NextResponse.json({ messages })
}
