import { getMyProfile } from '@/lib/auth'

export async function requireAdminProfile() {
  const profile = await getMyProfile()
  if (!profile || profile.role !== 'admin') return null
  return profile
}

