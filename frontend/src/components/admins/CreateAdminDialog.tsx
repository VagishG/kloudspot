import { useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { ApiError, adminsApi } from '../../api'
import type { AdminInput } from '../../api/types'
import { validateAdminForm, type AdminFormErrors } from '../../lib/validation'
import { Button, Input, Modal } from '../ui'

interface CreateAdminDialogProps {
  open: boolean
  onClose: () => void
  onCreated: (name: string) => void
}

const emptyValues: AdminInput = { name: '', email: '', password: '' }

export function CreateAdminDialog({ open, onClose, onCreated }: CreateAdminDialogProps) {
  const [values, setValues] = useState<AdminInput>(emptyValues)
  const [errors, setErrors] = useState<AdminFormErrors>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const reset = () => {
    setValues(emptyValues)
    setErrors({})
    setFormError('')
  }

  const update = <K extends keyof AdminInput>(key: K, value: AdminInput[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  const handleClose = () => {
    if (submitting) return
    reset()
    onClose()
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError('')

    const payload: AdminInput = {
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
    }

    const validationErrors = validateAdminForm(payload)
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      setFormError('Please fix the highlighted fields before saving.')
      return
    }

    setSubmitting(true)
    try {
      await adminsApi.create(payload)
      reset()
      onCreated(payload.name)
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        setErrors(error.fieldErrors as AdminFormErrors)
        setFormError(error.message)
      } else {
        setFormError(error instanceof Error ? error.message : 'Failed to create admin.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New admin"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="create-admin-form" loading={submitting}>
            Create admin
          </Button>
        </>
      }
    >
      <form id="create-admin-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
          <div className="flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 px-3 py-2.5">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
            <p className="text-sm text-red-700" role="alert">
              {formError}
            </p>
          </div>
        )}

        <Input
          label="Full name"
          placeholder="e.g. Meera Nair"
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          error={errors.name}
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
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={values.password}
          onChange={(e) => update('password', e.target.value)}
          error={errors.password}
          required
        />
      </form>
    </Modal>
  )
}
