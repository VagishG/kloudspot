import { useCallback, useEffect, useState } from 'react'
import { employeesApi } from '../api'

interface Stats {
  total: number
  active: number
  inactive: number
}

export function useEmployeeStats() {
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      employeesApi.list({ page: 1, size: 1 }),
      employeesApi.list({ page: 1, size: 1, status: 'active' }),
      employeesApi.list({ page: 1, size: 1, status: 'inactive' }),
    ])
      .then(([all, active, inactive]) => {
        if (!cancelled) {
          setStats({ total: all.total, active: active.total, inactive: inactive.total })
        }
      })
      .catch(() => {
        if (!cancelled) setStats({ total: 0, active: 0, inactive: 0 })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((value) => value + 1), [])

  return { ...stats, loading, refresh }
}
