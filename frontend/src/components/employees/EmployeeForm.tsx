import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { ApiError } from '../../api'
import type { Department, Employee, EmployeeInput } from '../../api/types'
import { validateEmployeeForm, type FormErrors } from '../../lib/validation'
import { CreateDepartmentDialog } from '../departments/CreateDepartmentDialog'
import { Button, Input, Select } from '../ui'

const NEW_DEPARTMENT = '__new__'

interface EmployeeFormProps {
  departments: Department[]
  initialValues?: Employee
  submitLabel: string
  onSubmit: (values: EmployeeInput) => Promise<void>
  onCancel: () => void
}

interface FormState {
  empId: string
  fullName: string
  email: string
  phoneNumber: string
  departmentId: string
  designation: string
  dateOfJoining: string
  salary: string
  status: boolean
}

const emptyState: FormState = {
  empId: '',
  fullName: '',
  email: '',
  phoneNumber: '',
  departmentId: '',
  designation: '',
  dateOfJoining: '',
  salary: '',
  status: true,
}

function toFormState(employee?: Employee): FormState {
  if (!employee) return emptyState
  return {
    empId: employee.empId,
    fullName: employee.fullName,
    email: employee.email,
    phoneNumber: employee.phoneNumber,
    departmentId: employee.departmentId,
    designation: employee.designation,
    dateOfJoining: employee.dateOfJoining,
    salary: String(employee.salary),
    status: employee.status,
  }
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="border-b border-slate-100 px-5 py-3">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
    </div>
  )
}

export function EmployeeForm({
  departments,
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: EmployeeFormProps) {
  const [values, setValues] = useState<FormState>(() => toFormState(initialValues))
  const [errors, setErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [dirty, setDirty] = useState(false)

  const isEdit = Boolean(initialValues)

  const [extraDepartments, setExtraDepartments] = useState<Department[]>([])
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false)

  const departmentsList = useMemo(() => {
    const known = new Set(departments.map((dept) => dept.id))
    return [...departments, ...extraDepartments.filter((dept) => !known.has(dept.id))]
  }, [departments, extraDepartments])

  const handleDepartmentCreated = (department: Department) => {
    setExtraDepartments((prev) => [...prev, department])
    setDepartmentDialogOpen(false)
    update('departmentId', department.id)
  }

  useEffect(() => {
    if (!dirty) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
    setErrors((prev) => (prev[key as keyof EmployeeInput] ? { ...prev, [key]: undefined } : prev))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError('')

    const payload: EmployeeInput = {
      empId: values.empId.trim(),
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phoneNumber: values.phoneNumber.trim(),
      departmentId: values.departmentId,
      designation: values.designation.trim(),
      dateOfJoining: values.dateOfJoining,
      salary: values.salary === '' ? NaN : Number(values.salary),
      status: values.status,
    }

    const validationErrors = validateEmployeeForm(payload)
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      setFormError('Please fix the highlighted fields before saving.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(payload)
      setDirty(false)
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        setErrors(error.fieldErrors as FormErrors)
        setFormError(error.message)
      } else {
        setFormError(error instanceof Error ? error.message : 'Failed to save employee.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {formError && (
        <div className="mb-4 flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 px-3 py-2.5">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
          <p className="text-sm text-red-700" role="alert">
            {formError}
          </p>
        </div>
      )}

      <div className="card overflow-hidden">
        <SectionTitle title="Personal details" />
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <Input
            label="Full name"
            placeholder="e.g. Priya Sharma"
            value={values.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            error={errors.fullName}
            required
          />
          <Input
            label="Email address"
            type="email"
            placeholder="name@kloudspot.com"
            value={values.email}
            onChange={(e) => update('email', e.target.value)}
            error={errors.email}
            required
          />
          <Input
            label="Phone number"
            type="tel"
            placeholder="+91 98765 43210"
            value={values.phoneNumber}
            onChange={(e) => update('phoneNumber', e.target.value)}
            error={errors.phoneNumber}
            required
          />
          <Input
            label="Employee ID"
            placeholder="e.g. KS-1042"
            value={values.empId}
            onChange={(e) => update('empId', e.target.value)}
            error={errors.empId}
            hint={isEdit ? "Employee ID can't be changed." : undefined}
            readOnly={isEdit}
            required
          />
        </div>

        <SectionTitle title="Job details" />
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <Select
            label="Department"
            placeholder="Select department"
            value={values.departmentId}
            onChange={(e) => {
              if (e.target.value === NEW_DEPARTMENT) {
                setDepartmentDialogOpen(true)
                return
              }
              update('departmentId', e.target.value)
            }}
            error={errors.departmentId}
            required
          >
            {departmentsList.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
            <option value={NEW_DEPARTMENT}>+ New department</option>
          </Select>
          <Input
            label="Designation"
            placeholder="e.g. Software Engineer"
            value={values.designation}
            onChange={(e) => update('designation', e.target.value)}
            error={errors.designation}
            required
          />
          <Input
            label="Date of joining"
            type="date"
            value={values.dateOfJoining}
            onChange={(e) => update('dateOfJoining', e.target.value)}
            error={errors.dateOfJoining}
            required
          />
          <Input
            label="Annual salary (INR)"
            type="number"
            min={0}
            step={1000}
            placeholder="e.g. 850000"
            value={values.salary}
            onChange={(e) => update('salary', e.target.value)}
            error={errors.salary}
            required
          />

          <div className="sm:col-span-2">
            <span className="field-label">Employment status</span>
            <div className="inline-flex rounded-md border border-slate-300 p-0.5">
              {[
                { label: 'Active', value: true },
                { label: 'Inactive', value: false },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => update('status', option.value)}
                  aria-pressed={values.status === option.value}
                  className={
                    values.status === option.value
                      ? 'rounded px-4 py-1.5 text-sm font-medium text-white transition-colors bg-brand-600'
                      : 'rounded px-4 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100'
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <Button variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {submitLabel}
          </Button>
        </div>
      </div>

      <CreateDepartmentDialog
        open={departmentDialogOpen}
        onClose={() => setDepartmentDialogOpen(false)}
        onCreated={handleDepartmentCreated}
      />
    </form>
  )
}
