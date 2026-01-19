import { redirect } from 'next/navigation'

import { NavBar } from '@/components/NavBar'
import { getSessionUser } from '@/lib/auth'

import { ReportClient } from './report-client'

export const dynamic = 'force-dynamic'

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getSessionUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-zinc-50 [background-image:radial-gradient(800px_circle_at_25%_0%,rgba(15,23,42,0.06),transparent_55%),radial-gradient(800px_circle_at_80%_-10%,rgba(16,185,129,0.10),transparent_55%)]">
      <NavBar />
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <ReportClient id={id} />
      </div>
    </div>
  )
}
