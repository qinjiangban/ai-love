'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Loader2, RotateCcw } from 'lucide-react'

import { ActionPlan } from '@/components/ActionPlan'
import { ReportStatusBadge } from '@/components/ReportStatusBadge'
import { ScoreBars } from '@/components/ScoreBars'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { ReportResult } from '@/lib/validation'

type ReportDto = {
  id: string
  status: 'queued' | 'generating' | 'succeeded' | 'failed'
  input: unknown
  result: ReportResult | null
  error_message: string | null
  created_at: string
}

export function ReportClient() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id

  const [report, setReport] = useState<ReportDto | null>(null)
  const [active, setActive] = useState<'analysis' | 'tips' | 'plan'>('analysis')
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  async function fetchReport() {
    setError(null)
    const res = await fetch(`/api/report/${id}`, { cache: 'no-store' })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? '加载失败')
      return
    }
    const data = await res.json()
    setReport(data.report)
  }

  useEffect(() => {
    fetchReport()
  }, [id])

  useEffect(() => {
    if (!report) return
    if (report.status === 'generating' || report.status === 'queued') {
      const t = setTimeout(fetchReport, 1800)
      return () => clearTimeout(t)
    }
  }, [report?.status])

  const title = useMemo(() => report?.result?.title ?? '报告详情', [report?.result?.title])
  const createdAt = useMemo(() => {
    if (!report?.created_at) return ''
    return new Date(report.created_at).toLocaleString()
  }, [report?.created_at])

  async function retry() {
    setRetrying(true)
    try {
      const res = await fetch(`/api/report/${id}/retry`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error ?? '重试失败')
        return
      }
      await fetchReport()
    } finally {
      setRetrying(false)
    }
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-sm text-rose-700">{error}</div>
        <div className="mt-4">
          <Button variant="secondary" onClick={() => router.push('/')}>
            返回首页
          </Button>
        </div>
      </Card>
    )
  }

  if (!report) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-sm text-zinc-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          加载中…
        </div>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-1">
          <div className="text-2xl font-semibold text-white">{title}</div>
          <div className="text-sm text-zinc-300">{createdAt}</div>
        </div>
        <div className="flex items-center gap-3">
          <ReportStatusBadge status={report.status} />
          {report.status === 'failed' ? (
            <Button variant="secondary" onClick={retry} disabled={retrying}>
              {retrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              重试
            </Button>
          ) : null}
        </div>
      </div>

      {report.status === 'generating' || report.status === 'queued' ? (
        <Card className="p-6">
          <div className="grid gap-2">
            <div className="text-sm font-semibold text-zinc-900">正在生成报告</div>
            <div className="text-sm text-zinc-600">预计 10–30 秒，页面会自动刷新。</div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
              <div className="h-2 w-1/2 animate-pulse rounded-full bg-zinc-300" />
            </div>
          </div>
        </Card>
      ) : null}

      {report.status === 'failed' ? (
        <Card className="p-6">
          <div className="text-sm font-semibold text-zinc-900">生成失败</div>
          <div className="mt-2 text-sm text-zinc-600">
            {report.error_message ?? '未知错误'}
          </div>
        </Card>
      ) : null}

      {report.status === 'succeeded' && report.result ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Card className="p-6">
              <div className="text-sm font-semibold text-zinc-900">概览</div>
              <div className="mt-3 text-sm leading-6 text-zinc-700">{report.result.overview}</div>

              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    active === 'analysis'
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                  onClick={() => setActive('analysis')}
                >
                  分析
                </button>
                <button
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    active === 'tips'
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                  onClick={() => setActive('tips')}
                >
                  建议
                </button>
                <button
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    active === 'plan'
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                  onClick={() => setActive('plan')}
                >
                  行动计划
                </button>
              </div>

              {active === 'analysis' ? (
                <div className="mt-6 grid gap-4">
                  {report.result.baziAnalysis.map((b) => (
                    <div key={b.title} className="rounded-2xl border border-zinc-200 bg-white p-4">
                      <div className="text-sm font-semibold text-zinc-900">{b.title}</div>
                      <div className="mt-2 text-sm leading-6 text-zinc-700">{b.content}</div>
                    </div>
                  ))}
                </div>
              ) : null}

              {active === 'tips' ? (
                <div className="mt-6 grid gap-4">
                  {report.result.gettingAlongTips.map((t) => (
                    <div key={t.title} className="rounded-2xl border border-zinc-200 bg-white p-4">
                      <div className="text-sm font-semibold text-zinc-900">{t.title}</div>
                      <div className="mt-3 grid gap-2">
                        {t.tips.map((tip) => (
                          <div key={tip} className="flex gap-2 text-sm text-zinc-700">
                            <div className="mt-2 h-1 w-1 rounded-full bg-zinc-400" />
                            <div className="leading-6">{tip}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {active === 'plan' ? (
                <div className="mt-6">
                  <ActionPlan
                    days7={report.result.actionPlan.days7}
                    days30={report.result.actionPlan.days30}
                  />
                </div>
              ) : null}
            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card className="p-6">
              <div className="text-sm font-semibold text-zinc-900">匹配刻度</div>
              <div className="mt-4">
                <ScoreBars scores={report.result.scores} />
              </div>

              <div className="mt-6 text-xs leading-5 text-zinc-500">
                {report.result.disclaimers.map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  )
}
