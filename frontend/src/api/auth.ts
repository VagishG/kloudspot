import { request } from './client'
import type { LoginResponse } from './types'

export const authApi = {
  login(email: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>('POST', '/api/admin/login', { email, password })
  },
}
