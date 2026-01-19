import { cn } from '@/lib/utils/cn'

export function Tag(
  props: React.HTMLAttributes<HTMLSpanElement> & {
    tone?: 'neutral' | 'success' | 'warning' | 'danger'
  }
) {
  const { className, tone = 'neutral', ...rest } = props

  const tones: Record<typeof tone, string> = {
    neutral: 'bg-zinc-100 text-zinc-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-rose-100 text-rose-700',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        tones[tone],
        className
      )}
      {...rest}
    />
  )
}

