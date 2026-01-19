'use client'

import { cn } from '@/lib/utils/cn'

export function ScoreBars(props: {
  scores: {
    communication: number
    conflict: number
    intimacy: number
    stability: number
    growth: number
  }
}) {
  const items: Array<{ key: keyof typeof props.scores; label: string }> = [
    { key: 'communication', label: '沟通' },
    { key: 'conflict', label: '冲突化解' },
    { key: 'intimacy', label: '亲密度' },
    { key: 'stability', label: '稳定性' },
    { key: 'growth', label: '共同成长' },
  ]

  return (
    <div className="grid gap-3">
      {items.map((it) => {
        const value = props.scores[it.key]
        const good = value >= 70
        const mid = value >= 45 && value < 70
        const bar = good ? 'bg-emerald-500' : mid ? 'bg-amber-500' : 'bg-rose-500'
        return (
          <div key={it.key} className="grid gap-1">
            <div className="flex items-center justify-between text-xs text-zinc-600">
              <div>{it.label}</div>
              <div className="tabular-nums">{value}</div>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-100">
              <div
                className={cn('h-2 rounded-full transition-all', bar)}
                style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

