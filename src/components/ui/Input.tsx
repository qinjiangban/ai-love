'use client'

import { cn } from '@/lib/utils/cn'

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    error?: string
  }
) {
  const { className, error, ...rest } = props
  return (
    <div className="w-full">
      <input
        className={cn(
          'h-10 w-full rounded-xl border bg-white px-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400',
          error ? 'border-rose-300 focus:border-rose-400' : 'border-zinc-200 focus:border-zinc-400',
          className
        )}
        {...rest}
      />
      {error ? <div className="mt-1 text-xs text-rose-600">{error}</div> : null}
    </div>
  )
}

