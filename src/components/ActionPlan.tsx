'use client'

import { useMemo } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'

import { cn } from '@/lib/utils/cn'

export function ActionPlan(props: {
  days7: Array<{ day: string; tasks: string[] }>
  days30: Array<{ week: string; goals: string[] }>
  state: { days7: boolean[]; days30: boolean[] }
  onToggle: (bucket: 'days7' | 'days30', index: number, checked: boolean) => void
}) {
  const total = useMemo(() => {
    const a = props.days7.reduce((acc, d) => acc + d.tasks.length, 0)
    const b = props.days30.reduce((acc, w) => acc + w.goals.length, 0)
    return a + b
  }, [props.days7, props.days30])

  const total7 = useMemo(() => props.days7.reduce((acc, d) => acc + d.tasks.length, 0), [props.days7])
  const total30 = useMemo(() => props.days30.reduce((acc, w) => acc + w.goals.length, 0), [props.days30])

  const done = useMemo(() => {
    const d7 = props.state.days7.slice(0, total7).filter(Boolean).length
    const d30 = props.state.days30.slice(0, total30).filter(Boolean).length
    return d7 + d30
  }, [props.state.days7, props.state.days30, total7, total30])

  const day7Offsets = useMemo(() => {
    const offsets: number[] = []
    let cur = 0
    for (const d of props.days7) {
      offsets.push(cur)
      cur += d.tasks.length
    }
    return offsets
  }, [props.days7])

  const day30Offsets = useMemo(() => {
    const offsets: number[] = []
    let cur = 0
    for (const w of props.days30) {
      offsets.push(cur)
      cur += w.goals.length
    }
    return offsets
  }, [props.days30])
  const progressPct = useMemo(() => (total > 0 ? Math.round((done / total) * 100) : 0), [done, total])

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
        <div className="text-sm font-medium text-zinc-900">进度</div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-28 overflow-hidden rounded-full bg-zinc-200">
            <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="text-sm tabular-nums text-zinc-700">
            {done}/{total}
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="text-sm font-semibold text-zinc-900">7 天行动</div>
        <div className="grid gap-3">
          {props.days7.map((d, dayIndex) => (
            <div key={d.day} className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="text-sm font-medium text-zinc-900">{d.day}</div>
              <div className="mt-3 grid gap-2">
                {d.tasks.map((t, taskIndexInDay) => {
                  const index = day7Offsets[dayIndex] + taskIndexInDay
                  const isChecked = Boolean(props.state.days7[index])
                  return (
                    <button
                      key={`d7:${index}`}
                      className={cn(
                        'flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left text-sm transition-colors hover:bg-zinc-50',
                        isChecked ? 'text-zinc-500' : 'text-zinc-900'
                      )}
                      onClick={() => props.onToggle('days7', index, !isChecked)}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                      ) : (
                        <Circle className="mt-0.5 h-5 w-5 text-zinc-400" />
                      )}
                      <div className={cn(isChecked ? 'line-through' : '')}>{t}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <div className="text-sm font-semibold text-zinc-900">30 天行动</div>
        <div className="grid gap-3">
          {props.days30.map((w, weekIndex) => (
            <div key={w.week} className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="text-sm font-medium text-zinc-900">{w.week}</div>
              <div className="mt-3 grid gap-2">
                {w.goals.map((g, goalIndexInWeek) => {
                  const index = day30Offsets[weekIndex] + goalIndexInWeek
                  const isChecked = Boolean(props.state.days30[index])
                  return (
                    <button
                      key={`d30:${index}`}
                      className={cn(
                        'flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left text-sm transition-colors hover:bg-zinc-50',
                        isChecked ? 'text-zinc-500' : 'text-zinc-900'
                      )}
                      onClick={() => props.onToggle('days30', index, !isChecked)}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                      ) : (
                        <Circle className="mt-0.5 h-5 w-5 text-zinc-400" />
                      )}
                      <div className={cn(isChecked ? 'line-through' : '')}>{g}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
