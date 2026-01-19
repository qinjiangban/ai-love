'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Loader2, Lock, Mail } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

export function LoginClient() {
  const router = useRouter()
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const canSend = useMemo(() => /.+@.+\..+/.test(email), [email])
  const canSubmit = useMemo(() => {
    if (!canSend) return false
    if (password.trim().length < 8) return false
    if (mode === 'signUp' && confirmPassword.trim() !== password.trim()) return false
    return true
  }, [canSend, password, confirmPassword, mode])

  async function submit() {
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      const url = mode === 'signIn' ? '/api/auth/sign-in' : '/api/auth/sign-up'
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error ?? '操作失败，请稍后重试。')
        return
      }

      if (mode === 'signUp') {
        if (data?.needsEmailConfirm) {
          setInfo('注册成功，请到邮箱点击确认链接完成激活，然后再用邮箱+密码登录。')
          setMode('signIn')
          return
        }
      }

      router.replace('/')
      router.refresh()
    } catch {
      setError('网络错误或服务不可用，请稍后重试。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-md gap-6">
      <div className="grid gap-2">
        <div className="text-2xl font-semibold text-white">邮箱登录</div>
        <div className="text-sm leading-6 text-zinc-300">使用邮箱与密码登录/注册，登录后可保存与回看报告。</div>
      </div>

      <Card className="p-6">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={mode === 'signIn' ? 'primary' : 'secondary'}
              onClick={() => {
                setMode('signIn')
                setError(null)
                setInfo(null)
              }}
              disabled={loading}
            >
              登录
            </Button>
            <Button
              variant={mode === 'signUp' ? 'primary' : 'secondary'}
              onClick={() => {
                setMode('signUp')
                setError(null)
                setInfo(null)
              }}
              disabled={loading}
            >
              注册
            </Button>
          </div>

          <div className="grid gap-2">
            <div className="text-xs text-zinc-600">邮箱</div>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              inputMode="email"
              autoComplete="email"
            />
          </div>

          <div className="grid gap-2">
            <div className="text-xs text-zinc-600">密码</div>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 8 位"
              type="password"
              autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
            />
          </div>

          {mode === 'signUp' ? (
            <div className="grid gap-2">
              <div className="text-xs text-zinc-600">确认密码</div>
              <Input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入密码"
                type="password"
                autoComplete="new-password"
              />
            </div>
          ) : null}

          <Button onClick={submit} disabled={!canSubmit || loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'signIn' ? <Lock className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
            {mode === 'signIn' ? '登录' : '注册'}
          </Button>

          {info ? (
            <div className="rounded-xl border border-emerald-300/50 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {info}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-rose-300/50 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </div>
      </Card>

      <div className="text-xs leading-5 text-zinc-400">
        继续即表示你理解：本服务仅供参考，不构成任何专业建议。
      </div>
    </div>
  )
}
