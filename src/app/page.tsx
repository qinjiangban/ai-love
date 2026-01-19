import { HomeClient } from '@/app/_components/HomeClient'
import { NavBar } from '@/components/NavBar'

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(80%_60%_at_50%_0%,rgba(109,94,243,0.25),rgba(11,16,32,0)_70%),radial-gradient(60%_40%_at_0%_20%,rgba(16,185,129,0.18),rgba(11,16,32,0)_70%)]">
      <NavBar />
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <HomeClient />
      </div>
    </div>
  )
}
