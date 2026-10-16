import { request } from './client'
import type { Admin, AdminInput } from './types'

export const adminsApi = {
  list(): Promise<Admin[]> {
    return request<Admin[]>('GET', '/api/admins')
  },
  create(input: AdminInput): Promise<Admin> {
    return request<Admin>('POST', '/api/admins', input)
  },
}
