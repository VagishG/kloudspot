import { useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { ApiError, departmentsApi } from '../../api'
import type { Department, DepartmentInput } from '../../api/types'
import { validateDepartmentForm, type DepartmentFormErrors } from '../../lib/validation'
import { Button, Input, Modal } from '../ui'

interface CreateDepartmentDialogProps {
  open: boolean
  onClose: () => void
  onCreated: (department: Department) => void
}

const emptyValues: DepartmentInput = { name: '' }

export function CreateDepartmentDialog({ open, onClose, onCreated }: CreateDepartmentDialogProps) {
  const [values, setValues] = useState<DepartmentInput>(emptyValues)
  const [errors, setErrors] = useState<DepartmentFormErrors>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const reset = () => {
    setValues(emptyValues)
    setErrors({})
    setFormError('')
  }

  const handleClose = () => {
    if (submitting) return
    reset()
    onClose()
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError('')

    const payload: DepartmentInput = { name: values.name.trim() }

    const validationErrors = validateDepartmentForm(payload)
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      setFormError('Please fix the highlighted fields before saving.')
      return
    }

    setSubmitting(true)
    try {
      const created = await departmentsApi.create(payload)
      reset()
      onCreated(created)
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        setErrors(error.fieldErrors as DepartmentFormErrors)
        setFormError(error.message)
      } else {
        setFormError(error instanceof Error ? error.message : 'Failed to create department.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New department"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="create-department-form" loading={submitting}>
            Create department
          </Button>
        </>
      }
    >
      <form id="create-department-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
          <div className="flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 px-3 py-2.5">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
            <p className="text-sm text-red-700" role="alert">
              {formError}
            </p>
          </div>
        )}

        <Input
          label="Department name"
          placeholder="e.g. Engineering"
          value={values.name}
          onChange={(e) => {
            setValues({ name: e.target.value })
            setErrors({})
          }}
          error={errors.name}
          autoFocus
          required
        />
      </form>
    </Modal>
  )
}
