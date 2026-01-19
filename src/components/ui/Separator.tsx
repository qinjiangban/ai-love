import { cn } from '@/lib/utils/cn'

export function Separator(
  props: React.HTMLAttributes<HTMLDivElement> & {
    orientation?: 'horizontal' | 'vertical'
  }
) {
  const { className, orientation = 'horizontal', ...rest } = props
  return (
    <div
      className={cn(
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        'bg-zinc-200',
        className
      )}
      {...rest}
    />
  )
}

