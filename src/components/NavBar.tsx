'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { LogIn, LogOut, Sparkles, Shield } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
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

  const avatarText = useMemo(() => {
    const email = me?.user?.email?.trim() ?? ''
    if (!email) return 'U'
    const s = email.split('@')[0] ?? email
    const first = s[0] ?? 'U'
    const second = s[1] ?? ''
    return (first + second).toUpperCase()
  }, [me?.user?.email])

  return (
    <div
      className={cn(
        'w-full border-b border-zinc-200 bg-white/70 backdrop-blur',
        props.className
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">

          <div
            role="img"
            aria-label="logo"
            className="h-12 w-12 bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/favicon.ico)' }}
          />

          <div className="flex flex-col">
            <div className="text-sm font-semibold text-zinc-900">Ai Love</div>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 rounded-full p-0"
                  aria-label="用户菜单"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{avatarText}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                  <div className="grid gap-1">
                    <div className="text-sm font-medium text-zinc-900">已登录</div>
                    <div className="truncate text-xs text-zinc-500">{me.user.email}</div>
                  </div>
                </DropdownMenuLabel>
{/*                 <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/analyze">
                    <Sparkles className="h-4 w-4" />
                    开始生成报告
                  </Link>
                </DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    void logout()
                  }}
                  disabled={loading}
                >
                  <LogOut className="h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="primary" size="sm">
                <LogIn className="h-4 w-4" />
                登录
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
