'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Save } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

type AdminUser = { id: string; email: string; role: 'user' | 'admin'; created_at: string }
type AdminReport = { id: string; user_id: string; status: string; created_at: string }
type Template = {
  id: string
  name: string
  is_default: boolean
  model: string
  system_prompt: string
  user_prompt_template: string
  updated_at: string
}

export function AdminClient() {
  const [tab, setTab] = useState<'users' | 'reports' | 'templates'>('reports')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [reports, setReports] = useState<AdminReport[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeLabel = useMemo(() => {
    if (tab === 'users') return '用户'
    if (tab === 'templates') return '内容模板'
    return '报告'
  }, [tab])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      if (tab === 'users') {
        const res = await fetch('/api/admin/users', { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error ?? '加载失败')
        setUsers(data.users ?? [])
        return
      }
      if (tab === 'templates') {
        const res = await fetch('/api/admin/templates', { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error ?? '加载失败')
        setTemplates(data.templates ?? [])
        return
      }
      const res = await fetch('/api/admin/reports', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? '加载失败')
      setReports(data.reports ?? [])
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message)
      else setError('加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [tab])

  async function setRole(id: string, role: 'user' | 'admin') {
    setError(null)
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, role }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      setError(data?.error ?? '操作失败')
      return
    }
    await load()
  }

  async function updateTemplate(id: string, patch: Partial<Template>) {
    setError(null)
    const res = await fetch(`/api/admin/templates/${id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      setError(data?.error ?? '保存失败')
      return
    }
    await load()
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <div className="text-2xl font-semibold text-white">后台管理</div>
        <div className="text-sm text-zinc-300">用户、报告与内容模板</div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: 'reports', label: '报告' },
            { key: 'users', label: '用户' },
            { key: 'templates', label: '内容模板' },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              tab === t.key
                ? 'bg-white text-zinc-900'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-300/40 bg-rose-950/30 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-zinc-900">{activeLabel}</div>
          <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            刷新
          </Button>
        </div>

        {loading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-zinc-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            加载中…
          </div>
        ) : tab === 'users' ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-zinc-500">
                <tr>
                  <th className="py-2">邮箱</th>
                  <th className="py-2">角色</th>
                  <th className="py-2">创建时间</th>
                  <th className="py-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-zinc-100">
                    <td className="py-3 text-zinc-900">{u.email}</td>
                    <td className="py-3 text-zinc-700">{u.role}</td>
                    <td className="py-3 text-zinc-700">
                      {new Date(u.created_at).toLocaleString()}
                    </td>
                    <td className="py-3">
                      {u.role === 'admin' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setRole(u.id, 'user')}
                        >
                          取消管理员
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setRole(u.id, 'admin')}
                        >
                          设为管理员
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tab === 'templates' ? (
          <div className="mt-4 grid gap-4">
            {templates.map((t) => (
              <div key={t.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm font-semibold text-zinc-900">{t.name}</div>
                  <div className="text-xs text-zinc-500">{t.is_default ? '默认' : '非默认'}</div>
                </div>
                <div className="mt-3 grid gap-2">
                  <div className="text-xs text-zinc-600">模型</div>
                  <Input
                    value={t.model}
                    onChange={(e) =>
                      setTemplates((s) =>
                        s.map((x) => (x.id === t.id ? { ...x, model: e.target.value } : x))
                      )
                    }
                  />
                </div>
                <div className="mt-3 grid gap-2">
                  <div className="text-xs text-zinc-600">系统提示词</div>
                  <textarea
                    className="min-h-24 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none"
                    value={t.system_prompt}
                    onChange={(e) =>
                      setTemplates((s) =>
                        s.map((x) =>
                          x.id === t.id ? { ...x, system_prompt: e.target.value } : x
                        )
                      )
                    }
                  />
                </div>
                <div className="mt-3 grid gap-2">
                  <div className="text-xs text-zinc-600">用户提示词模板</div>
                  <textarea
                    className="min-h-24 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none"
                    value={t.user_prompt_template}
                    onChange={(e) =>
                      setTemplates((s) =>
                        s.map((x) =>
                          x.id === t.id
                            ? { ...x, user_prompt_template: e.target.value }
                            : x
                        )
                      )
                    }
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => updateTemplate(t.id, { is_default: true })}
                  >
                    设为默认
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      updateTemplate(t.id, {
                        model: t.model,
                        system_prompt: t.system_prompt,
                        user_prompt_template: t.user_prompt_template,
                      })
                    }
                  >
                    <Save className="h-4 w-4" />
                    保存
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-zinc-500">
                <tr>
                  <th className="py-2">报告ID</th>
                  <th className="py-2">用户ID</th>
                  <th className="py-2">状态</th>
                  <th className="py-2">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-t border-zinc-100">
                    <td className="py-3 font-mono text-xs text-zinc-900">{r.id}</td>
                    <td className="py-3 font-mono text-xs text-zinc-700">{r.user_id}</td>
                    <td className="py-3 text-zinc-700">{r.status}</td>
                    <td className="py-3 text-zinc-700">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
