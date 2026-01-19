import { NavBar } from '@/components/NavBar'
import { LoginClient } from '@/app/login/LoginClient'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(80%_60%_at_50%_0%,rgba(109,94,243,0.25),rgba(11,16,32,0)_70%)]">
      <NavBar />
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <LoginClient />
      </div>
    </div>
  )
}

