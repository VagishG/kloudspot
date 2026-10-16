import { AlertTriangle } from 'lucide-react'
import { Button, Modal } from '../ui'
import type { Employee } from '../../api/types'

interface DeleteEmployeeDialogProps {
  employee: Employee | null
  deleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteEmployeeDialog({
  employee,
  deleting,
  onCancel,
  onConfirm,
}: DeleteEmployeeDialogProps) {
  return (
    <Modal
      open={Boolean(employee)}
      onClose={onCancel}
      title="Delete employee"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={deleting}>
            Delete employee
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="size-4 text-red-600" aria-hidden="true" />
        </div>
        <p className="text-sm text-slate-600">
          Are you sure you want to delete{' '}
          <span className="font-medium text-slate-900">{employee?.fullName}</span> ({employee?.empId})?
          This action cannot be undone.
        </p>
      </div>
    </Modal>
  )
}
