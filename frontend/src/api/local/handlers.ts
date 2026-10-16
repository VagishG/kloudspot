import { ApiError } from '../client'
import type { Admin, AdminInput, DepartmentInput, Employee, EmployeeInput, ListResponse } from '../types'
import { loadDb, saveDb, type AppDb } from './db'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function parseUrl(path: string): { segments: string[]; query: URLSearchParams } {
  const [pathname = '', search = ''] = path.split('?')
  return {
    segments: pathname.split('/').filter(Boolean),
    query: new URLSearchParams(search),
  }
}

function requireString(
  value: unknown,
  field: string,
  label: string,
  errors: Record<string, string>,
): string {
  const str = typeof value === 'string' ? value.trim() : ''
  if (!str) errors[field] = `${label} is required`
  return str
}

function validateEmployee(
  body: EmployeeInput,
  db: AppDb,
  currentId?: string,
): Record<string, string> {
  const errors: Record<string, string> = {}

  const empId = requireString(body?.empId, 'empId', 'Employee ID', errors)
  if (empId && db.employees.some((e) => e.empId.toLowerCase() === empId.toLowerCase() && e.id !== currentId)) {
    errors.empId = 'This Employee ID is already in use'
  }

  requireString(body?.fullName, 'fullName', 'Full name', errors)

  const email = requireString(body?.email, 'email', 'Email address', errors)
  if (email && !EMAIL_RE.test(email)) errors.email = 'Enter a valid email address'
  else if (email && db.employees.some((e) => e.email.toLowerCase() === email.toLowerCase() && e.id !== currentId)) {
    errors.email = 'An employee with this email already exists'
  }

  const phone = requireString(body?.phoneNumber, 'phoneNumber', 'Phone number', errors)
  if (phone && phone.replace(/\D/g, '').length < 10) errors.phoneNumber = 'Enter a valid phone number'

  requireString(body?.departmentId, 'departmentId', 'Department', errors)
  requireString(body?.designation, 'designation', 'Designation', errors)
  requireString(body?.dateOfJoining, 'dateOfJoining', 'Date of joining', errors)

  if (body?.salary === undefined || body?.salary === null || Number.isNaN(body.salary)) {
    errors.salary = 'Salary is required'
  } else if (body.salary <= 0) {
    errors.salary = 'Salary must be greater than 0'
  }

  return errors
}

function toEmployee(input: EmployeeInput): EmployeeInput {
  return {
    ...input,
    salary: Number(input.salary),
  }
}

function listEmployees(db: AppDb, query: URLSearchParams): ListResponse<Employee> {
  const page = Math.max(1, Number(query.get('page') ?? 1) || 1)
  const size = Math.max(1, Number(query.get('size') ?? 10) || 10)
  const search = (query.get('search') ?? '').trim().toLowerCase()
  const department = query.get('department') ?? ''
  const status = query.get('status') ?? ''

  let rows = [...db.employees]

  if (search) {
    rows = rows.filter(
      (e) =>
        e.fullName.toLowerCase().includes(search) ||
        e.email.toLowerCase().includes(search) ||
        e.empId.toLowerCase().includes(search),
    )
  }
  if (department) rows = rows.filter((e) => e.departmentId === department)
  if (status === 'active') rows = rows.filter((e) => e.status)
  if (status === 'inactive') rows = rows.filter((e) => !e.status)

  rows.sort((a, b) => a.fullName.localeCompare(b.fullName))

  const total = rows.length
  const start = (page - 1) * size
  const data = rows.slice(start, start + size).map((e) => ({
    ...e,
    departmentName: db.departments.find((d) => d.id === e.departmentId)?.name,
  }))

  return { data, total, page, size }
}

function toCsv(rows: Employee[]): string {
  const header = [
    'Employee ID',
    'Full Name',
    'Email',
    'Phone',
    'Department',
    'Designation',
    'Date of Joining',
    'Salary',
    'Status',
  ]
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const lines = rows.map((e) =>
    [
      e.empId,
      e.fullName,
      e.email,
      e.phoneNumber,
      e.departmentName ?? '',
      e.designation,
      e.dateOfJoining,
      e.salary,
      e.status ? 'Active' : 'Inactive',
    ]
      .map(escape)
      .join(','),
  )
  return [header.map(escape).join(','), ...lines].join('\n')
}

export function handleLocalRequest<T>(method: string, path: string, body?: unknown): T {
  const db = loadDb()
  const { segments, query } = parseUrl(path)
  // segments: ['api', ...]
  const [, resource, ...rest] = segments

  if (resource === 'admin' && rest[0] === 'login' && method === 'POST') {
    const { email, password } = (body ?? {}) as { email?: string; password?: string }
    const match = db.admins.find(
      (a) => a.email === email?.trim().toLowerCase() && a.password === password,
    )
    if (!match) {
      throw new ApiError('Invalid email or password', 401)
    }
    const admin: Admin = {
      id: match.id,
      name: match.name,
      email: match.email,
      createdAt: match.createdAt,
    }
    return { token: `token-${Date.now()}`, admin } as T
  }

  if (resource === 'admins' && method === 'GET') {
    return db.admins.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      createdAt: a.createdAt,
    })) as T
  }

  if (resource === 'admins' && method === 'POST') {
    const input = (body ?? {}) as AdminInput
    const errors: Record<string, string> = {}

    const name = requireString(input.name, 'name', 'Name', errors)
    const email = requireString(input.email, 'email', 'Email address', errors)
    if (email && !EMAIL_RE.test(email)) {
      errors.email = 'Enter a valid email address'
    } else if (email && db.admins.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
      errors.email = 'An admin with this email already exists'
    }

    const password = typeof input.password === 'string' ? input.password : ''
    if (!password) errors.password = 'Password is required'
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters'

    if (Object.keys(errors).length) {
      throw new ApiError('Please correct the highlighted fields', 400, errors)
    }

    const created = {
      id: `admin-${db.admins.length + 1}`,
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    }
    db.admins.push(created)
    saveDb(db)
    return {
      id: created.id,
      name: created.name,
      email: created.email,
      createdAt: created.createdAt,
    } as T
  }

  if (resource === 'departments' && method === 'GET') {
    return db.departments as T
  }

  if (resource === 'departments' && method === 'POST') {
    const input = (body ?? {}) as DepartmentInput
    const errors: Record<string, string> = {}
    const name = requireString(input.name, 'name', 'Department name', errors)

    if (name && db.departments.some((d) => d.name.toLowerCase() === name.toLowerCase())) {
      errors.name = 'A department with this name already exists'
    }

    if (Object.keys(errors).length) {
      throw new ApiError('Please correct the highlighted fields', 400, errors)
    }

    const created = { id: `dep-${db.departments.length + 1}`, name }
    db.departments.push(created)
    saveDb(db)
    return created as T
  }

  if (resource === 'emp') {
    if (rest[0] === 'search' && method === 'GET') {
      const keyword = decodeURIComponent(rest[1] ?? '').toLowerCase()
      query.set('search', keyword)
      return listEmployees(db, query) as T
    }

    if (rest[0] === 'export' && method === 'GET') {
      const { data } = listEmployees(db, query)
      return { csv: toCsv(data) } as T
    }

    if (rest.length === 0 && method === 'GET') {
      return listEmployees(db, query) as T
    }

    if (rest[0] === 'add' && method === 'POST') {
      const input = (body ?? {}) as EmployeeInput
      const errors = validateEmployee(input, db)
      if (Object.keys(errors).length) {
        throw new ApiError('Please correct the highlighted fields', 400, errors)
      }
      const now = new Date().toISOString()
      const created: Employee = {
        ...toEmployee(input),
        id: `emp-${db.seq++}`,
        departmentName: db.departments.find((d) => d.id === input.departmentId)?.name,
        createdBy: db.admins[0].id,
        createdAt: now,
        updatedAt: now,
        updatedBy: db.admins[0].id,
      }
      db.employees.push(created)
      saveDb(db)
      return created as T
    }

    if (rest.length === 1 && method === 'GET') {
      const found = db.employees.find((e) => e.id === rest[0])
      if (!found) throw new ApiError('Employee not found', 404)
      return {
        ...found,
        departmentName: db.departments.find((d) => d.id === found.departmentId)?.name,
      } as T
    }

    if (rest.length === 1 && method === 'PATCH') {
      const idx = db.employees.findIndex((e) => e.id === rest[0])
      if (idx === -1) throw new ApiError('Employee not found', 404)
      const input = { ...db.employees[idx], ...(body ?? {}) } as EmployeeInput
      const errors = validateEmployee(input, db, rest[0])
      if (Object.keys(errors).length) {
        throw new ApiError('Please correct the highlighted fields', 400, errors)
      }
      const updated: Employee = {
        ...db.employees[idx],
        ...toEmployee(input),
        departmentName: db.departments.find((d) => d.id === input.departmentId)?.name,
        updatedAt: new Date().toISOString(),
        updatedBy: db.admins[0].id,
      }
      db.employees[idx] = updated
      saveDb(db)
      return updated as T
    }

    if (rest.length === 1 && method === 'DELETE') {
      const idx = db.employees.findIndex((e) => e.id === rest[0])
      if (idx === -1) throw new ApiError('Employee not found', 404)
      db.employees.splice(idx, 1)
      saveDb(db)
      return undefined as T
    }
  }

  throw new ApiError(`Unsupported request: ${method} ${path}`, 404)
}
