import { useCallback, useEffect, useMemo, useState } from 'react'
import { employeesApi } from '../api'
import type { Employee, ListParams } from '../api/types'

interface DataState {
  key: string
  data: Employee[]
  total: number
  error: string
}

export function useEmployees(params: ListParams) {
  const [reloadKey, setReloadKey] = useState(0)
  const { page, size, search, department, status } = params

  const key = useMemo(
    () => JSON.stringify({ page, size, search, department, status, reloadKey }),
    [page, size, search, department, status, reloadKey],
  )

  const [state, setState] = useState<DataState>({ key: '', data: [], total: 0, error: '' })

  useEffect(() => {
    let cancelled = false

    employeesApi
      .list({ page, size, search, department, status })
      .then((response) => {
        if (!cancelled) {
          setState({ key, data: response.data, total: response.total, error: '' })
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            key,
            error: error instanceof Error ? error.message : 'Failed to load employees',
          }))
        }
      })

    return () => {
      cancelled = true
    }
  }, [key, page, size, search, department, status])

  const reload = useCallback(() => setReloadKey((value) => value + 1), [])

  return {
    data: state.data,
    total: state.total,
    error: state.error,
    loading: state.key !== key,
    reload,
  }
}
