import { request } from './client'
import type { Employee, EmployeeInput, ListParams, ListResponse } from './types'

function buildQuery(params: Partial<ListParams>): string {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.size) query.set('size', String(params.size))
  if (params.search) query.set('search', params.search)
  if (params.department) query.set('department', params.department)
  if (params.status) query.set('status', params.status)
  const str = query.toString()
  return str ? `?${str}` : ''
}

export const employeesApi = {
  list(params: ListParams): Promise<ListResponse<Employee>> {
    return request<ListResponse<Employee>>('GET', `/api/emp${buildQuery(params)}`)
  },

  get(id: string): Promise<Employee> {
    return request<Employee>('GET', `/api/emp/${encodeURIComponent(id)}`)
  },

  create(input: EmployeeInput): Promise<Employee> {
    return request<Employee>('POST', '/api/emp/add', input)
  },

  update(id: string, input: EmployeeInput): Promise<Employee> {
    return request<Employee>('PATCH', `/api/emp/${encodeURIComponent(id)}`, input)
  },

  remove(id: string): Promise<void> {
    return request<void>('DELETE', `/api/emp/${encodeURIComponent(id)}`)
  },

  async exportCsv(params: Partial<ListParams>): Promise<void> {
    const { csv } = await request<{ csv: string }>(
      'GET',
      `/api/emp/export${buildQuery(params)}`,
    )
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `employees-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },
}
