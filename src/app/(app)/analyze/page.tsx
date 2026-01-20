import { HomeClient } from '@/app/_components/HomeClient'
import { NavBar } from '@/components/NavBar'

export default function AnalyzePage() {
  return (
    <div className="min-h-screen bg-zinc-50 bg-[radial-gradient(800px_circle_at_25%_0%,rgba(15,23,42,0.06),transparent_55%),radial-gradient(800px_circle_at_80%_-10%,rgba(16,185,129,0.10),transparent_55%)]">
      <NavBar />
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <HomeClient />
      </div>
    </div>
  )
}
