'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { LogIn, LogOut, Shield, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

type MeResponse = {
  user: { id: string; email: string } | null
  profile: { role: 'user' | 'admin' } | null
}

export function NavBar(props: { className?: string }) {
  const [me, setMe] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/me', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return
        setMe(data)
      })
      .catch(() => {
        if (cancelled) return
        setMe({ user: null, profile: null })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const isAdmin = useMemo(() => me?.profile?.role === 'admin', [me])

  async function logout() {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      location.href = '/'
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        'w-full border-b border-zinc-200 bg-white/70 backdrop-blur',
        props.className
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="text-sm font-semibold text-zinc-900">情侣八字适配</div>
            <div className="text-xs text-zinc-500">分析 · 建议 · 行动计划</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Link href="/admin">
              <Button variant="secondary" size="sm">
                <Shield className="h-4 w-4" />
                后台
              </Button>
            </Link>
          ) : null}

          {me?.user ? (
            <div className="flex items-center gap-2">
              <div className="hidden max-w-[260px] truncate text-sm text-zinc-600 sm:block">
                {me.user.email}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={logout}
                disabled={loading}
              >
                <LogOut className="h-4 w-4" />
                退出
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="primary" size="sm">
                <LogIn className="h-4 w-4" />
                邮箱登录
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

