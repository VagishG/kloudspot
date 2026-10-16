import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/cn'

interface PaginationProps {
  page: number
  size: number
  total: number
  onPageChange: (page: number) => void
  onSizeChange?: (size: number) => void
}

const sizeOptions = [10, 25, 50]

function pageRange(page: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)

  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)

  const result: (number | '...')[] = []
  let previous = 0
  for (const p of sorted) {
    if (previous && p - previous > 1) result.push('...')
    result.push(p)
    previous = p
  }
  return result
}

export function Pagination({ page, size, total, onPageChange, onSizeChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / size))
  if (total === 0) return null

  const from = (page - 1) * size + 1
  const to = Math.min(page * size, total)

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row">
      <div className="flex items-center gap-4">
        <p className="text-xs text-slate-500">
          Showing <span className="font-medium text-slate-700">{from}</span>-
          <span className="font-medium text-slate-700">{to}</span> of{' '}
          <span className="font-medium text-slate-700">{total}</span>
        </p>
        {onSizeChange && (
          <label className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
            Rows per page
            <select
              value={size}
              onChange={(event) => onSizeChange(Number(event.target.value))}
              aria-label="Rows per page"
              className="field-input h-8 w-16 py-0 pl-2 text-xs"
            >
              {sizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex size-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-500 outline-none transition hover:bg-slate-50 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>

        {pageRange(page, totalPages).map((item, index) =>
          item === '...' ? (
            <span key={`gap-${index}`} className="px-1.5 text-xs text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-md text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-brand-500/40',
                item === page
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
              )}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex size-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-500 outline-none transition hover:bg-slate-50 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </nav>
    </div>
  )
}
