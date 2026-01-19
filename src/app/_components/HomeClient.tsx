'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'

import { ReportStatusBadge } from '@/components/ReportStatusBadge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { coupleInputSchema, type CoupleInput } from '@/lib/validation'

type ReportListItem = {
  id: string
  status: 'queued' | 'generating' | 'succeeded' | 'failed'
  created_at: string
}

function defaultInput(): CoupleInput {
  return {
    personA: { birthDate: '' },
    personB: { birthDate: '' },
  }
}

const draftKey = 'couple-input-draft:v1'

export function HomeClient() {
  const router = useRouter()
  const [me, setMe] = useState<{ user: { id: string; email: string } | null } | null>(null)
  const [reports, setReports] = useState<ReportListItem[]>([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<CoupleInput>(defaultInput())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [banner, setBanner] = useState<string | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(draftKey)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        const v = coupleInputSchema.safeParse(parsed)
        if (v.success) setForm(v.data)
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(draftKey, JSON.stringify(form))
  }, [form])

  useEffect(() => {
    fetch('/api/me', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setMe(data))
      .catch(() => setMe({ user: null }))
  }, [])

  async function refreshReports() {
    setLoadingReports(true)
    try {
      const res = await fetch('/api/report/list', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      setReports(data.reports ?? [])
    } finally {
      setLoadingReports(false)
    }
  }

  useEffect(() => {
    if (me?.user) refreshReports()
  }, [me?.user?.id])

  const isAuthed = Boolean(me?.user)

  const headerTitle = useMemo(() => {
    const a = form.personA.name?.trim() || 'TA'
    const b = form.personB.name?.trim() || '对方'
    return `${a} × ${b}`
  }, [form.personA.name, form.personB.name])

  function setField<K extends keyof CoupleInput['personA']>(
    person: 'personA' | 'personB',
    key: K,
    value: CoupleInput['personA'][K]
  ) {
    setForm((s) => ({
      ...s,
      [person]: {
        ...s[person],
        [key]: value,
      },
    }))
  }

  function validate() {
    const res = coupleInputSchema.safeParse(form)
    if (res.success) {
      setErrors({})
      return true
    }
    const e: Record<string, string> = {}
    for (const issue of res.error.issues) {
      const path = issue.path.join('.')
      e[path] = '请检查格式或补全必填项'
    }
    setErrors(e)
    return false
  }

  async function submit() {
    setBanner(null)
    if (!validate()) return
    if (!isAuthed) {
      setBanner('登录后才能保存报告，请先邮箱登录。')
      router.push('/login')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/report/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ input: form }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setBanner(data?.error ?? '生成失败，请稍后重试。')
        return
      }

      const data = await res.json()
      router.push(`/report/${data.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-8">
      <div className="grid gap-3">
        <div className="inline-flex items-center gap-2 text-xs text-zinc-300">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          仅供参考 · 不用于现实决策
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{headerTitle} 的相处画像</h1>
        <p className="max-w-2xl text-sm leading-6 text-zinc-300">
          输入双方出生日期（可选时辰/地点）生成八字适配分析，并给出相处建议与 7/30 天行动计划。
        </p>
      </div>

      {banner ? (
        <div className="rounded-2xl border border-rose-300/40 bg-rose-950/30 px-4 py-3 text-sm text-rose-100">
          {banner}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-zinc-900">TA（左侧）</div>
            <div className="text-xs text-zinc-500">必填：出生日期</div>
          </div>

          <div className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <div className="text-xs text-zinc-600">称呼（可选）</div>
              <Input
                value={form.personA.name ?? ''}
                onChange={(e) => setField('personA', 'name', e.target.value)}
                placeholder="比如：小明"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <div className="text-xs text-zinc-600">出生日期</div>
                <Input
                  type="date"
                  value={form.personA.birthDate}
                  onChange={(e) => setField('personA', 'birthDate', e.target.value)}
                  error={errors['personA.birthDate']}
                />
              </div>
              <div className="grid gap-2">
                <div className="text-xs text-zinc-600">出生时间（可选）</div>
                <Input
                  type="time"
                  value={form.personA.birthTime ?? ''}
                  onChange={(e) =>
                    setField(
                      'personA',
                      'birthTime',
                      e.target.value ? e.target.value : undefined
                    )
                  }
                  error={errors['personA.birthTime']}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <div className="text-xs text-zinc-600">性别（可选）</div>
                <Select
                  value={form.personA.gender ?? ''}
                  onChange={(e) =>
                    setField(
                      'personA',
                      'gender',
                      (e.target.value
                        ? (e.target.value as CoupleInput['personA']['gender'])
                        : undefined)
                    )
                  }
                >
                  <option value="">不填写</option>
                  <option value="male">男</option>
                  <option value="female">女</option>
                  <option value="other">其他</option>
                </Select>
              </div>
              <div className="grid gap-2">
                <div className="text-xs text-zinc-600">出生地（可选）</div>
                <Input
                  value={form.personA.birthPlace ?? ''}
                  onChange={(e) =>
                    setField(
                      'personA',
                      'birthPlace',
                      e.target.value ? e.target.value : undefined
                    )
                  }
                  placeholder="比如：杭州"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-zinc-900">对方（右侧）</div>
            <div className="text-xs text-zinc-500">必填：出生日期</div>
          </div>

          <div className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <div className="text-xs text-zinc-600">称呼（可选）</div>
              <Input
                value={form.personB.name ?? ''}
                onChange={(e) => setField('personB', 'name', e.target.value)}
                placeholder="比如：小红"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <div className="text-xs text-zinc-600">出生日期</div>
                <Input
                  type="date"
                  value={form.personB.birthDate}
                  onChange={(e) => setField('personB', 'birthDate', e.target.value)}
                  error={errors['personB.birthDate']}
                />
              </div>
              <div className="grid gap-2">
                <div className="text-xs text-zinc-600">出生时间（可选）</div>
                <Input
                  type="time"
                  value={form.personB.birthTime ?? ''}
                  onChange={(e) =>
                    setField(
                      'personB',
                      'birthTime',
                      e.target.value ? e.target.value : undefined
                    )
                  }
                  error={errors['personB.birthTime']}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <div className="text-xs text-zinc-600">性别（可选）</div>
                <Select
                  value={form.personB.gender ?? ''}
                  onChange={(e) =>
                    setField(
                      'personB',
                      'gender',
                      (e.target.value
                        ? (e.target.value as CoupleInput['personA']['gender'])
                        : undefined)
                    )
                  }
                >
                  <option value="">不填写</option>
                  <option value="male">男</option>
                  <option value="female">女</option>
                  <option value="other">其他</option>
                </Select>
              </div>
              <div className="grid gap-2">
                <div className="text-xs text-zinc-600">出生地（可选）</div>
                <Input
                  value={form.personB.birthPlace ?? ''}
                  onChange={(e) =>
                    setField(
                      'personB',
                      'birthPlace',
                      e.target.value ? e.target.value : undefined
                    )
                  }
                  placeholder="比如：上海"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <Button className="sm:w-auto" size="lg" onClick={submit} disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
          生成报告
        </Button>
        <div className="text-sm text-zinc-300">
          {isAuthed ? '生成后会自动保存到“我的报告”。' : '未登录状态无法保存报告。'}
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-zinc-900">我的报告</div>
          {isAuthed ? (
            <Button variant="secondary" size="sm" onClick={refreshReports} disabled={loadingReports}>
              刷新
            </Button>
          ) : (
            <Link href="/login" className="text-sm text-zinc-600 underline">
              登录后查看
            </Link>
          )}
        </div>

        {!isAuthed ? (
          <div className="mt-4 text-sm text-zinc-600">请先邮箱登录。</div>
        ) : reports.length === 0 ? (
          <div className="mt-4 text-sm text-zinc-600">还没有报告，先生成一份吧。</div>
        ) : (
          <div className="mt-4 grid gap-2">
            {reports.map((r) => (
              <Link
                key={r.id}
                href={`/report/${r.id}`}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 transition-colors hover:bg-zinc-50"
              >
                <div className="grid gap-1">
                  <div className="text-sm font-medium text-zinc-900">报告</div>
                  <div className="text-xs text-zinc-500">
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
                <ReportStatusBadge status={r.status} />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
