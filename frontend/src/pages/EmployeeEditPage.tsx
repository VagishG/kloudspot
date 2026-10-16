import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { employeesApi } from '../api'
import type { Employee, EmployeeInput } from '../api/types'
import { EmployeeForm } from '../components/employees/EmployeeForm'
import { Button, PageHeader, Skeleton, useToast } from '../components/ui'
import { useDepartments } from '../hooks/useDepartments'

export function EmployeeEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { departments } = useDepartments()

  const [state, setState] = useState<{ id: string; employee: Employee | null; error: string }>({
    id: '',
    employee: null,
    error: '',
  })

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

  const handleSubmit = async (values: EmployeeInput) => {
    const updated = await employeesApi.update(id, values)
    toast(`${updated.fullName} was updated.`)
    navigate(`/employees/${id}`, { replace: true })
  }

  const breadcrumb = (
    <>
      <Link to="/employees" className="text-slate-500 transition hover:text-brand-600">
        Employees
      </Link>
      <span className="px-1.5 text-slate-300">/</span>
      <span className="text-slate-600">Edit</span>
    </>
  )

  if (loading) {
    return (
      <>
        <PageHeader breadcrumb={breadcrumb} title="Edit employee" />
        <div className="card space-y-4 p-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </>
    )
  }

  if (error || !employee) {
    return (
      <>
        <PageHeader breadcrumb={breadcrumb} title="Edit employee" />
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
        title="Edit employee"
        description={`Update details for ${employee.fullName}.`}
        onBack={() => navigate(`/employees/${id}`)}
      />
      <EmployeeForm
        departments={departments}
        initialValues={employee}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/employees/${id}`)}
      />
    </>
  )
}
