import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  breadcrumb?: ReactNode
  onBack?: () => void
}

export function PageHeader({ title, description, actions, breadcrumb, onBack }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumb && <div className="mb-2 text-xs text-slate-500">{breadcrumb}</div>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              title="Go back"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 outline-none transition hover:bg-slate-50 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-brand-500/40"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
