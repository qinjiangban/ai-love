import { cn } from '@/lib/utils/cn'

export function Alert(
  props: React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'success' | 'destructive'
  }
) {
  const { className, variant = 'default', ...rest } = props

  const variants: Record<typeof variant, string> = {
    default: 'border-zinc-200 bg-white text-zinc-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    destructive: 'border-rose-200 bg-rose-50 text-rose-900',
  }

  return (
    <div
      className={cn(
        'rounded-2xl border px-4 py-3 text-sm leading-6',
        variants[variant],
        className
      )}
      role={variant === 'destructive' ? 'alert' : 'status'}
      {...rest}
    />
  )
}

