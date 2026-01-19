import { NextResponse } from 'next/server'

import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await getSupabaseServerClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    return NextResponse.json({ reports: [] })
  }

  const { data } = await supabase
    .from('couple_reports')
    .select('id,status,created_at,input')
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ reports: data ?? [] })
}
