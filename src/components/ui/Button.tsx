'use client'

import { cn } from '@/lib/utils/cn'

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
  }
) {
  const {
    className,
    variant = 'primary',
    size = 'md',
    type = 'button',
    ...rest
  } = props

  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50'

  const variants: Record<typeof variant, string> = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-800',
    secondary:
      'bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50',
    ghost: 'bg-transparent text-zinc-900 hover:bg-zinc-100',
    danger: 'bg-rose-600 text-white hover:bg-rose-500',
  }

  const sizes: Record<typeof size, string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
  }

  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    />
  )
}
