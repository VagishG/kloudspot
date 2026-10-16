import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-1 text-sm text-slate-500">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/employees"
        className="mt-6 inline-flex h-9 items-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white shadow-xs outline-none transition-colors hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500/40"
      >
        Back to employees
      </Link>
    </div>
  )
}
