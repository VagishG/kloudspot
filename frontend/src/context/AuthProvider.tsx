import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '../api'
import type { Admin } from '../api/types'
import { AuthContext } from './auth-context'

function readStoredAdmin(): Admin | null {
  try {
    const raw = localStorage.getItem('ks.admin')
    return raw ? (JSON.parse(raw) as Admin) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(readStoredAdmin)

  const login = useCallback(async (email: string, password: string) => {
    const { token, admin: loggedIn } = await authApi.login(email, password)
    localStorage.setItem('ks.token', token)
    localStorage.setItem('ks.admin', JSON.stringify(loggedIn))
    setAdmin(loggedIn)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ks.token')
    localStorage.removeItem('ks.admin')
    setAdmin(null)
  }, [])

  const value = useMemo(
    () => ({ admin, isAuthenticated: Boolean(admin && localStorage.getItem('ks.token')), login, logout }),
    [admin, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
