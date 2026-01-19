import { cn } from '@/lib/utils/cn'

export function Skeleton(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-zinc-200/70', className)}
      {...rest}
    />
  )
}

