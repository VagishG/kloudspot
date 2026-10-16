export interface Admin {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface AdminInput {
  name: string
  email: string
  password: string
}

export interface Department {
  id: string
  name: string
}

export interface DepartmentInput {
  name: string
}

export interface Employee {
  id: string
  empId: string
  fullName: string
  email: string
  phoneNumber: string
  departmentId: string
  departmentName?: string
  designation: string
  dateOfJoining: string
  salary: number
  status: boolean
  createdBy?: string
  createdAt?: string
  updatedAt?: string
  updatedBy?: string
}

export interface EmployeeInput {
  empId: string
  fullName: string
  email: string
  phoneNumber: string
  departmentId: string
  designation: string
  dateOfJoining: string
  salary: number
  status: boolean
}

export interface ListParams {
  page: number
  size: number
  search?: string
  department?: string
  status?: 'active' | 'inactive' | ''
}

export interface ListResponse<T> {
  data: T[]
  total: number
  page: number
  size: number
}

export interface LoginResponse {
  token: string
  admin: Admin
}

export interface FieldErrors {
  [field: string]: string
}
