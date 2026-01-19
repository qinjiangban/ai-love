import { cn } from '@/lib/utils/cn'

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props
  return (
    <div
      className={cn(
        'rounded-2xl border border-zinc-200 bg-white shadow-sm',
        className
      )}
      {...rest}
    />
  )
}

