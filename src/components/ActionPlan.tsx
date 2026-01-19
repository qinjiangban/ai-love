'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'

import { cn } from '@/lib/utils/cn'

export function ActionPlan(props: {
  days7: Array<{ day: string; tasks: string[] }>
  days30: Array<{ week: string; goals: string[] }>
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const total = useMemo(() => {
    const a = props.days7.reduce((acc, d) => acc + d.tasks.length, 0)
    const b = props.days30.reduce((acc, w) => acc + w.goals.length, 0)
    return a + b
  }, [props.days7, props.days30])

  const done = useMemo(() => Object.values(checked).filter(Boolean).length, [checked])

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
        <div className="text-sm font-medium text-zinc-900">进度</div>
        <div className="text-sm tabular-nums text-zinc-700">
          {done}/{total}
        </div>
      </div>

      <div className="grid gap-3">
        <div className="text-sm font-semibold text-zinc-900">7 天行动</div>
        <div className="grid gap-3">
          {props.days7.map((d) => (
            <div key={d.day} className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="text-sm font-medium text-zinc-900">{d.day}</div>
              <div className="mt-3 grid gap-2">
                {d.tasks.map((t) => {
                  const id = `d7:${d.day}:${t}`
                  const isChecked = Boolean(checked[id])
                  return (
                    <button
                      key={id}
                      className={cn(
                        'flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left text-sm transition-colors hover:bg-zinc-50',
                        isChecked ? 'text-zinc-500' : 'text-zinc-900'
                      )}
                      onClick={() => setChecked((s) => ({ ...s, [id]: !s[id] }))}
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
          {props.days30.map((w) => (
            <div key={w.week} className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="text-sm font-medium text-zinc-900">{w.week}</div>
              <div className="mt-3 grid gap-2">
                {w.goals.map((g) => {
                  const id = `d30:${w.week}:${g}`
                  const isChecked = Boolean(checked[id])
                  return (
                    <button
                      key={id}
                      className={cn(
                        'flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left text-sm transition-colors hover:bg-zinc-50',
                        isChecked ? 'text-zinc-500' : 'text-zinc-900'
                      )}
                      onClick={() => setChecked((s) => ({ ...s, [id]: !s[id] }))}
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

