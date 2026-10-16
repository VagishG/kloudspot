import {
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { ToastContext, type ToastTone } from './toast-context'

interface ToastItem {
  id: number
  tone: ToastTone
  message: string
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, tone: ToastTone = 'success') => {
      const id = nextId.current++
      setItems((prev) => [...prev, { id, tone, message }])
      setTimeout(() => dismiss(id), 4500)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-md border bg-white px-4 py-3 shadow-md',
              item.tone === 'success' ? 'border-slate-200' : 'border-red-200',
            )}
          >
            {item.tone === 'success' ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
            ) : (
              <XCircle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
            )}
            <p className="flex-1 text-sm text-slate-700">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="-m-1 rounded p-1 text-slate-400 outline-none transition hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-brand-500/40"
              aria-label="Dismiss notification"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
