import { NextRequest, NextResponse } from 'next/server'

import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log('[API] Fetching report:', id)
  
  const supabase = await getSupabaseServerClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    console.log('[API] User not logged in:', userError)
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }
  console.log('[API] User ID:', userData.user.id)

  const { data, error } = await supabase
    .from('couple_reports')
    .select('id,status,input,result,error_message,created_at,model,template_id,action_plan_state')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[API] Database error:', error)
  }
  if (!data) {
    console.log('[API] Report not found or access denied')
  }

  if (error || !data) {
    return NextResponse.json({ error: '未找到报告' }, { status: 404 })
  }

  return NextResponse.json({ report: data })
}
