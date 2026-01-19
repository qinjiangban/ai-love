import { createClient } from '@supabase/supabase-js'

import { publicEnv } from '@/lib/env/public'
import { requireServiceRoleKey } from '@/lib/env/server'

export function getSupabaseAdminClient() {
  return createClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    requireServiceRoleKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
