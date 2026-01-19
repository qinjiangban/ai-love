import { NextResponse } from 'next/server'

import { getMyProfile } from '@/lib/auth'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase.auth.getUser()
  const user = data.user?.id && data.user.email ? { id: data.user.id, email: data.user.email } : null
  const profile = user ? await getMyProfile() : null
  return NextResponse.json({ user, profile })
}
