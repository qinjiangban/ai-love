'use client'

import { cn } from '@/lib/utils/cn'

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & {
    error?: string
  }
) {
  const { className, error, children, ...rest } = props
  return (
    <div className="w-full">
      <select
        className={cn(
          'h-10 w-full rounded-xl border bg-white px-3 text-sm text-zinc-900 outline-none transition-colors',
          error ? 'border-rose-300 focus:border-rose-400' : 'border-zinc-200 focus:border-zinc-400',
          className
        )}
        {...rest}
      >
        {children}
      </select>
      {error ? <div className="mt-1 text-xs text-rose-600">{error}</div> : null}
    </div>
  )
}

