'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Loader2, RotateCcw } from 'lucide-react'

import { ActionPlan } from '@/components/ActionPlan'
import { ReportStatusBadge } from '@/components/ReportStatusBadge'
import { ScoreBars } from '@/components/ScoreBars'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import type { ReportResult } from '@/lib/validation'

type ReportDto = {
  id: string
  status: 'queued' | 'generating' | 'succeeded' | 'failed'
  input: unknown
  result: ReportResult | null
  error_message: string | null
  created_at: string
  model?: string | null
  action_plan_state?: { days7?: boolean[]; days30?: boolean[] } | null
}

type ActionPlanState = { days7: boolean[]; days30: boolean[] }

function normalizeActionPlanState(raw: unknown): ActionPlanState {
  const s =
    typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}
  const days7Raw = (s as { days7?: unknown }).days7
  const days30Raw = (s as { days30?: unknown }).days30
  return {
    days7: Array.isArray(days7Raw) ? days7Raw.map(Boolean) : [],
    days30: Array.isArray(days30Raw) ? days30Raw.map(Boolean) : [],
  }
}

import { ReportChat } from '@/components/ReportChat'

export function ReportClient({ id }: { id: string }) {
  const router = useRouter()

  const [report, setReport] = useState<ReportDto | null>(null)
  const [active, setActive] = useState<'analysis' | 'tips' | 'plan' | 'question'>('analysis')
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)
  const [planState, setPlanState] = useState<ActionPlanState>({ days7: [], days30: [] })

  const fetchReport = useCallback(async () => {
    setError(null)
    const res = await fetch(`/api/report/${id}`, { cache: 'no-store' })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? '加载失败')
      return
    }
    const data = await res.json()
    setReport(data.report)
    setPlanState(normalizeActionPlanState(data.report?.action_plan_state))
  }, [id])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  useEffect(() => {
    if (!report) return
    if (report.status === 'generating' || report.status === 'queued') {
      const t = setTimeout(fetchReport, 1800)
      return () => clearTimeout(t)
    }
  }, [report, fetchReport])

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

  async function toggleTodo(bucket: 'days7' | 'days30', index: number, checked: boolean) {
    const prev = planState
    setPlanState((s) => {
      const next: ActionPlanState = {
        days7: [...s.days7],
        days30: [...s.days30],
      }
      const arr = bucket === 'days7' ? next.days7 : next.days30
      if (arr.length <= index) {
        for (let i = arr.length; i <= index; i++) arr.push(false)
      }
      arr[index] = checked
      return next
    })

    const res = await fetch(`/api/report/${id}/todo`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ bucket, index, checked }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setPlanState(prev)
      setError(data?.error ?? '保存失败')
      return
    }

    const data = await res.json().catch(() => null)
    if (data?.action_plan_state) {
      setPlanState(normalizeActionPlanState(data.action_plan_state))
    }
  }

  if (error) {
    return (
      <Card className="p-6">
        <Alert variant="destructive">{error}</Alert>
        <div className="mt-4">
          <Button variant="secondary" onClick={() => router.push('/')}>
            返回首页
          </Button>
        </div>
      </Card>
    )
  }

  if (report?.status === 'queued' || report?.status === 'generating') {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
        <h2 className="text-xl font-semibold text-zinc-900">报告正在生成中...</h2>
        <p className="mt-2 text-sm text-zinc-600">
          请稍候，AI 正在分析你们的八字与关系能量。<br />
          通常需要 30-60 秒，完成后页面会自动刷新。
        </p>
      </Card>
    )
  }

  if (!report) {
    return (
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="mt-2 h-4 w-40" />
            <div className="mt-6">
              <Skeleton className="h-10 w-52 rounded-full" />
            </div>
            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-3 h-3 w-11/12" />
                <Skeleton className="mt-2 h-3 w-10/12" />
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="mt-3 h-3 w-10/12" />
                <Skeleton className="mt-2 h-3 w-9/12" />
              </div>
            </div>
          </Card>
        </div>
        <div className="lg:col-span-4">
          <Card className="p-6">
            <Skeleton className="h-4 w-24" />
            <div className="mt-4 grid gap-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-11/12" />
              <Skeleton className="h-3 w-10/12" />
              <Skeleton className="h-3 w-9/12" />
            </div>
            <Separator className="my-6" />
            <Skeleton className="h-3 w-10/12" />
            <Skeleton className="mt-2 h-3 w-11/12" />
            <Skeleton className="mt-2 h-3 w-9/12" />
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/analyze" className="mt-1 hidden sm:block">
            <Button variant="ghost" size="sm" className="h-9 px-2">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </Link>

          <div className="grid gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-2xl font-semibold tracking-tight text-zinc-950">{title}</div>
              <ReportStatusBadge status={report.status} />
            </div>
            <div className="text-sm text-zinc-600">{createdAt}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/analyze" className="sm:hidden">
            <Button variant="secondary" size="sm">
              返回测算
            </Button>
          </Link>

          {report.status === 'failed' ? (
            <Button variant="secondary" onClick={retry} disabled={retrying}>
              {retrying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              重新生成
            </Button>
          ) : null}
        </div>
      </div>

      {(report.status as string) === 'generating' || (report.status as string) === 'queued' ? (
        <Alert>
          <div className="grid gap-2">
            <div className="text-sm font-medium text-zinc-900">正在生成报告</div>
            <div className="text-sm text-zinc-600">预计 10–30 秒，页面会自动刷新。</div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
              <div className="h-2 w-1/2 animate-pulse rounded-full bg-zinc-300" />
            </div>
          </div>
        </Alert>
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
        <>
          <ReportChat reportId={id} />
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Card className="p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="grid gap-1">
                    <div className="text-sm font-semibold text-zinc-900">概览</div>
                    <div className="text-sm leading-6 text-zinc-700">{report.result.overview}</div>
                  </div>
                  {report.model ? (
                    <div className="text-xs text-zinc-500">模型：{report.model}</div>
                  ) : null}
                </div>

                <Separator className="my-6" />

                <Tabs value={active} onValueChange={(v) => setActive(v as typeof active)}>
                  <TabsList>
                    <TabsTrigger value="analysis">分析</TabsTrigger>
                    <TabsTrigger value="tips">建议</TabsTrigger>
                    <TabsTrigger value="plan">行动计划</TabsTrigger>
                    {report.result.userQuestionAnalysis ? (
                      <TabsTrigger value="question">你的提问</TabsTrigger>
                    ) : null}
                  </TabsList>

                  <TabsContent value="analysis">
                    <div className="grid gap-4">
                      {report.result.baziAnalysis.map((b) => (
                        <div
                          key={b.title}
                          className="rounded-2xl border border-zinc-200 bg-white p-4"
                        >
                          <div className="text-sm font-semibold text-zinc-900">{b.title}</div>
                          <div className="mt-2 text-sm leading-6 text-zinc-700">{b.content}</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="tips">
                    <div className="grid gap-4">
                      {report.result.gettingAlongTips.map((t) => (
                        <div
                          key={t.title}
                          className="rounded-2xl border border-zinc-200 bg-white p-4"
                        >
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
                  </TabsContent>

                  <TabsContent value="plan">
                    <ActionPlan
                      days7={report.result.actionPlan.days7}
                      days30={report.result.actionPlan.days30}
                      state={planState}
                      onToggle={toggleTodo}
                    />
                  </TabsContent>

                  {report.result.userQuestionAnalysis ? (
                    <TabsContent value="question">
                      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                        <div className="text-sm font-semibold text-zinc-900">AI 回答</div>
                        <div className="mt-2 text-sm leading-6 text-zinc-700 whitespace-pre-wrap">
                          {report.result.userQuestionAnalysis}
                        </div>
                      </div>
                    </TabsContent>
                  ) : null}
                </Tabs>
              </Card>
            </div>

            <div className="lg:col-span-4">
              <Card className="p-6">
                <div className="text-sm font-semibold text-zinc-900">匹配刻度</div>
                <div className="mt-4">
                  <ScoreBars scores={report.result.scores} />
                </div>

                <Separator className="my-6" />

                <div className="text-xs leading-5 text-zinc-500">
                  {report.result.disclaimers.map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
