import { adminEmails } from '@/lib/env/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function getSessionUser() {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user
}

export async function getMyProfile() {
  const supabase = await getSupabaseServerClient()
  const user = await getSessionUser()
  if (!user?.id || !user.email) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,role,created_at,updated_at')
    .eq('id', user.id)
    .maybeSingle()

  if (!error && data) return data

  const role = adminEmails.includes(user.email.toLowerCase()) ? 'admin' : 'user'
  const inserted = await supabase
    .from('profiles')
    .insert({ id: user.id, email: user.email, role })
    .select('id,email,role,created_at,updated_at')
    .single()

  if (inserted.error) return null
  return inserted.data
}
