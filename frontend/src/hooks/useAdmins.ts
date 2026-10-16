import { useCallback, useEffect, useState } from 'react'
import { adminsApi } from '../api'
import type { Admin } from '../api/types'

interface AdminsState {
  key: string
  admins: Admin[]
  error: string
}

export function useAdmins() {
  const [reloadKey, setReloadKey] = useState(0)
  const key = String(reloadKey)

  const [state, setState] = useState<AdminsState>({ key: '', admins: [], error: '' })

  useEffect(() => {
    let cancelled = false

    adminsApi
      .list()
      .then((admins) => {
        if (!cancelled) setState({ key, admins, error: '' })
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            key,
            error: error instanceof Error ? error.message : 'Failed to load admins',
          }))
        }
      })

    return () => {
      cancelled = true
    }
  }, [key])

  const reload = useCallback(() => setReloadKey((value) => value + 1), [])

  return {
    admins: state.admins,
    error: state.error,
    loading: state.key !== key,
    reload,
  }
}
