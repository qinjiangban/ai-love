'use client'

import { cn } from '@/lib/utils/cn'

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    error?: string
  }
) {
  const { className, error, ...rest } = props
  return (
    <div className="w-full">
      <textarea
        className={cn(
          'w-full rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400',
          error ? 'border-rose-300 focus:border-rose-400' : 'border-zinc-200 focus:border-zinc-400',
          className
        )}
        {...rest}
      />
      {error ? <div className="mt-1 text-xs text-rose-600">{error}</div> : null}
    </div>
  )
}
