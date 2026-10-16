import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { employeesApi } from '../api'
import type { Employee } from '../api/types'
import { DeleteEmployeeDialog } from '../components/employees/DeleteEmployeeDialog'
import { StatusBadge } from '../components/employees/StatusBadge'
import { Avatar, Button, PageHeader, Skeleton, useToast } from '../components/ui'
import { formatCurrency, formatDate, formatDateTime } from '../lib/format'

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-3.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{value}</dd>
    </div>
  )
}

export function EmployeeDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const [state, setState] = useState<{ id: string; employee: Employee | null; error: string }>({
    id: '',
    employee: null,
    error: '',
  })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    employeesApi
      .get(id)
      .then((data) => {
        if (!cancelled) setState({ id, employee: data, error: '' })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            id,
            employee: null,
            error: err instanceof Error ? err.message : 'Failed to load employee',
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const loading = state.id !== id
  const employee = state.id === id ? state.employee : null
  const error = state.id === id ? state.error : ''

  const handleBack = () => {
    if (location.key !== 'default') navigate(-1)
    else navigate('/employees')
  }

  const handleDelete = async () => {
    if (!employee) return
    setDeleting(true)
    try {
      await employeesApi.remove(employee.id)
      toast(`${employee.fullName} was removed.`)
      navigate('/employees', { replace: true })
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to delete employee', 'error')
      setDeleting(false)
    }
  }

  const breadcrumb = (
    <>
      <Link to="/employees" className="text-slate-500 transition hover:text-brand-600">
        Employees
      </Link>
      <span className="px-1.5 text-slate-300">/</span>
      <span className="text-slate-600">Details</span>
    </>
  )

  if (loading) {
    return (
      <>
        <PageHeader breadcrumb={breadcrumb} title="Employee details" />
        <div className="card space-y-4 p-5">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </>
    )
  }

  if (error || !employee) {
    return (
      <>
        <PageHeader breadcrumb={breadcrumb} title="Employee details" />
        <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
          <AlertCircle className="size-6 text-slate-400" aria-hidden="true" />
          <p className="text-sm text-slate-600">{error || 'Employee not found'}</p>
          <Button
            variant="secondary"
            icon={<ArrowLeft className="size-4" aria-hidden="true" />}
            onClick={() => navigate('/employees')}
          >
            Back to employees
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        breadcrumb={breadcrumb}
        title="Employee details"
        onBack={handleBack}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Pencil className="size-4" aria-hidden="true" />}
              onClick={() => navigate(`/employees/${employee.id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 className="size-4" aria-hidden="true" />}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-semibold text-slate-900">Contact information</h3>
            </div>
            <dl className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0">
              <Detail label="Email address" value={employee.email} />
              <Detail label="Phone number" value={employee.phoneNumber} />
            </dl>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-semibold text-slate-900">Employment information</h3>
            </div>
            <dl className="grid grid-cols-1 gap-x-0 divide-y divide-slate-100 sm:grid-cols-2">
              <Detail label="Designation" value={employee.designation} />
              <Detail label="Annual salary" value={formatCurrency(employee.salary)} />
              <Detail label="Employment status" value={employee.status ? 'Active' : 'Inactive'} />
              <Detail label="Date of joining" value={formatDate(employee.dateOfJoining)} />
            </dl>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-semibold text-slate-900">Record</h3>
            </div>
            <dl className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0">
              <Detail label="Created at" value={formatDateTime(employee.createdAt)} />
              <Detail label="Last updated" value={formatDateTime(employee.updatedAt)} />
            </dl>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <div className="flex flex-col items-center text-center">
              <Avatar name={employee.fullName} size="xl" />
              <h2 className="mt-3 text-base font-semibold text-slate-900">{employee.fullName}</h2>
              <p className="mt-0.5 text-sm text-slate-500">{employee.designation}</p>
              <div className="mt-3">
                <StatusBadge status={employee.status} />
              </div>
            </div>

            <dl className="mt-5 space-y-3 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-xs text-slate-500">Employee ID</dt>
                <dd className="font-mono text-xs text-slate-700">{employee.empId}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-xs text-slate-500">Department</dt>
                <dd className="text-xs text-slate-700">{employee.departmentName ?? '-'}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-xs text-slate-500">Joined</dt>
                <dd className="text-xs tabular-nums text-slate-700">
                  {formatDate(employee.dateOfJoining)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <DeleteEmployeeDialog
        employee={confirmDelete ? employee : null}
        deleting={deleting}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </>
  )
}
