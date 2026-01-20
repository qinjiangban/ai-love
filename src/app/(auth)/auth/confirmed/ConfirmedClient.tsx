'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function ConfirmedClient({ nextUrl }: { nextUrl: string }) {
  const router = useRouter()

  useEffect(() => {
    try {
      const ch = new BroadcastChannel('auth')
      ch.postMessage({ type: 'confirmed' })
      ch.close()
    } catch {}

    try {
      localStorage.setItem('auth:confirmed', String(Date.now()))
    } catch {}
  }, [])

  return (
    <div className="min-h-screen bg-[radial-gradient(80%_60%_at_50%_0%,rgba(109,94,243,0.25),rgba(11,16,32,0)_70%)]">
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <Card className="p-6">
          <div className="text-lg font-semibold text-zinc-900">邮箱验证成功</div>
          <div className="mt-2 text-sm leading-6 text-zinc-600">
            你可以关闭此页面并返回原网页继续使用；如果原网页未自动更新，刷新一下即可。
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={() => router.replace(nextUrl)}>返回网站</Button>
            <Button variant="secondary" onClick={() => window.close()}>
              关闭此页
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

