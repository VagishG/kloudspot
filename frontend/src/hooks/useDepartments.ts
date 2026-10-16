import { useCallback, useEffect, useState } from 'react'
import { departmentsApi } from '../api'
import type { Department } from '../api/types'

interface DepartmentsState {
  key: string
  departments: Department[]
  error: string
}

export function useDepartments() {
  const [reloadKey, setReloadKey] = useState(0)
  const key = String(reloadKey)

  const [state, setState] = useState<DepartmentsState>({ key: '', departments: [], error: '' })

  useEffect(() => {
    let cancelled = false

    departmentsApi
      .list()
      .then((departments) => {
        if (!cancelled) setState({ key, departments, error: '' })
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            key,
            error: error instanceof Error ? error.message : 'Failed to load departments',
          }))
        }
      })

    return () => {
      cancelled = true
    }
  }, [key])

  const reload = useCallback(() => setReloadKey((value) => value + 1), [])

  return {
    departments: state.departments,
    error: state.error,
    loading: state.key !== key,
    reload,
  }
}
