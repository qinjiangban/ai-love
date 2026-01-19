import { cn } from '@/lib/utils/cn'

export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  const { className, ...rest } = props
  return (
    <label
      className={cn('text-sm font-medium leading-5 text-zinc-900', className)}
      {...rest}
    />
  )
}

