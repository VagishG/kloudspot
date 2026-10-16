import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { Button, Input } from '../components/ui'
import { useAuth } from '../context/auth-context'
import { ApiError } from '../api'

interface LocationState {
  from?: string
}

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as LocationState | null)?.from ?? '/employees'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to={from} replace />

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-md bg-brand-600 text-base font-bold text-white">
            K
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-slate-900">Kloudspot</span>
            <span className="block text-xs text-slate-500">Employee admin</span>
          </span>
        </div>

        <form onSubmit={onSubmit} noValidate className="card p-6">
          <h1 className="text-lg font-semibold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Use your admin account to continue.</p>

          {error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 px-3 py-2.5">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            </div>
          )}

          <div className="mt-5 space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="username"
              autoFocus
              placeholder="you@kloudspot.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" loading={submitting} className="mt-6 w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">Kloudspot Employee Admin</p>
      </div>
    </div>
  )
}
