import type { AdminInput, DepartmentInput, EmployeeInput } from '../api/types'

export type FormErrors = Partial<Record<keyof EmployeeInput, string>>
export type AdminFormErrors = Partial<Record<keyof AdminInput, string>>
export type DepartmentFormErrors = Partial<Record<keyof DepartmentInput, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmployeeForm(values: EmployeeInput): FormErrors {
  const errors: FormErrors = {}

  if (!values.empId.trim()) errors.empId = 'Employee ID is required'
  if (!values.fullName.trim()) errors.fullName = 'Full name is required'

  if (!values.email.trim()) errors.email = 'Email address is required'
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Enter a valid email address'

  if (!values.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required'
  else if (values.phoneNumber.replace(/\D/g, '').length < 10) {
    errors.phoneNumber = 'Enter a valid phone number'
  }

  if (!values.departmentId) errors.departmentId = 'Department is required'
  if (!values.designation.trim()) errors.designation = 'Designation is required'
  if (!values.dateOfJoining) errors.dateOfJoining = 'Date of joining is required'

  if (values.salary === undefined || values.salary === null || Number.isNaN(values.salary)) {
    errors.salary = 'Salary is required'
  } else if (values.salary <= 0) {
    errors.salary = 'Salary must be greater than 0'
  }

  return errors
}

export function validateAdminForm(values: AdminInput): AdminFormErrors {
  const errors: AdminFormErrors = {}

  if (!values.name.trim()) errors.name = 'Name is required'

  if (!values.email.trim()) errors.email = 'Email address is required'
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Enter a valid email address'

  if (!values.password) errors.password = 'Password is required'
  else if (values.password.length < 8) errors.password = 'Use at least 8 characters'

  return errors
}

export function validateDepartmentForm(values: DepartmentInput): DepartmentFormErrors {
  const errors: DepartmentFormErrors = {}

  if (!values.name.trim()) errors.name = 'Department name is required'

  return errors
}
