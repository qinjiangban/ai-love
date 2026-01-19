import { redirect } from 'next/navigation'

import { NavBar } from '@/components/NavBar'
import { getMyProfile, getSessionUser } from '@/lib/auth'

import { AdminClient } from './admin-client'

export default async function AdminPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  const profile = await getMyProfile()
  if (profile?.role !== 'admin') redirect('/')

  return (
    <div className="min-h-screen bg-[radial-gradient(80%_60%_at_50%_0%,rgba(109,94,243,0.25),rgba(11,16,32,0)_70%)]">
      <NavBar />
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <AdminClient />
      </div>
    </div>
  )
}

