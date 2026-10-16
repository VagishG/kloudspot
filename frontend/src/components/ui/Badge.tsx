import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'success' | 'neutral'

const tones: Record<Tone, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}

interface BadgeProps {
  tone?: Tone
  dot?: boolean
  children: ReactNode
}

export function Badge({ tone = 'neutral', dot = false, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        tones[tone],
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  )
}
