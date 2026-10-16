import { request } from './client'
import type { Department, DepartmentInput } from './types'

export const departmentsApi = {
  list(): Promise<Department[]> {
    return request<Department[]>('GET', '/api/departments')
  },
  create(input: DepartmentInput): Promise<Department> {
    return request<Department>('POST', '/api/departments', input)
  },
}
