import type { CSSProperties } from 'react'
import { cn } from '../../lib/cn'

interface SkeletonProps {
  className?: string
  style?: CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded bg-slate-200/70', className)}
      style={style}
      aria-hidden="true"
    />
  )
}

const columns = [24, 14, 18, 14, 14, 16]

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading employees">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex gap-4">
          {columns.map((width, i) => (
            <Skeleton key={i} className="h-3" style={{ width: `${width}%` }} />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-slate-100 px-4 py-3.5">
          <div className="flex items-center gap-4">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <Skeleton className="h-3.5" style={{ width: '18%' }} />
            <Skeleton className="h-3.5" style={{ width: '22%' }} />
            <Skeleton className="h-3.5" style={{ width: '14%' }} />
            <Skeleton className="h-3.5" style={{ width: '12%' }} />
            <Skeleton className="ml-auto h-3.5" style={{ width: '8%' }} />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  )
}
