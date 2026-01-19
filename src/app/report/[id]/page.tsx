import { redirect } from 'next/navigation'

import { NavBar } from '@/components/NavBar'
import { getSessionUser } from '@/lib/auth'

import { ReportClient } from './report-client'

export default async function ReportPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-[radial-gradient(80%_60%_at_50%_0%,rgba(109,94,243,0.25),rgba(11,16,32,0)_70%)]">
      <NavBar />
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <ReportClient />
      </div>
    </div>
  )
}

