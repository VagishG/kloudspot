import { describe, expect, it } from 'vitest'
import { validateAdminForm, validateDepartmentForm, validateEmployeeForm } from './validation'
import type { AdminInput, DepartmentInput, EmployeeInput } from '../api/types'

function validEmployee(overrides: Partial<EmployeeInput> = {}): EmployeeInput {
  return {
    empId: 'EMP-1001',
    fullName: 'Aarav Sharma',
    email: 'aarav.sharma@kloudspot.com',
    phoneNumber: '9876543210',
    departmentId: 'dept-1',
    designation: 'Software Engineer',
    dateOfJoining: '2024-06-01',
    salary: 650000,
    status: true,
    ...overrides,
  }
}

describe('validateEmployeeForm', () => {
  it('accepts a well formed employee', () => {
    expect(validateEmployeeForm(validEmployee())).toEqual({})
  })

  it('requires the mandatory fields', () => {
    const errors = validateEmployeeForm({
      empId: '',
      fullName: '',
      email: '',
      phoneNumber: '',
      departmentId: '',
      designation: '',
      dateOfJoining: '',
      salary: 0,
      status: true,
    })

    expect(errors.empId).toBeDefined()
    expect(errors.fullName).toBeDefined()
    expect(errors.email).toBeDefined()
    expect(errors.phoneNumber).toBeDefined()
    expect(errors.departmentId).toBeDefined()
    expect(errors.designation).toBeDefined()
    expect(errors.dateOfJoining).toBeDefined()
    expect(errors.salary).toBeDefined()
  })

  it('rejects an invalid email', () => {
    expect(validateEmployeeForm(validEmployee({ email: 'nope' })).email).toBe(
      'Enter a valid email address',
    )
  })

  it('rejects a short phone number', () => {
    expect(validateEmployeeForm(validEmployee({ phoneNumber: '12345' })).phoneNumber).toBe(
      'Enter a valid phone number',
    )
  })

  it('rejects a non positive salary', () => {
    expect(validateEmployeeForm(validEmployee({ salary: -1 })).salary).toBe(
      'Salary must be greater than 0',
    )
  })
})

describe('validateAdminForm', () => {
  function validAdmin(overrides: Partial<AdminInput> = {}): AdminInput {
    return { name: 'Priya Nair', email: 'priya@kloudspot.com', password: 'password123', ...overrides }
  }

  it('accepts valid input', () => {
    expect(validateAdminForm(validAdmin())).toEqual({})
  })

  it('rejects a short password and invalid email', () => {
    const errors = validateAdminForm(validAdmin({ email: 'bad', password: 'abc' }))
    expect(errors.email).toBe('Enter a valid email address')
    expect(errors.password).toBe('Use at least 8 characters')
  })
})

describe('validateDepartmentForm', () => {
  function validDepartment(overrides: Partial<DepartmentInput> = {}): DepartmentInput {
    return { name: 'Engineering', ...overrides }
  }

  it('accepts a name', () => {
    expect(validateDepartmentForm(validDepartment())).toEqual({})
  })

  it('requires a name', () => {
    expect(validateDepartmentForm(validDepartment({ name: '   ' })).name).toBe(
      'Department name is required',
    )
  })
})
