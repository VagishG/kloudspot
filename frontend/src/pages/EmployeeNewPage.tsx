import { useNavigate, Link } from 'react-router-dom'
import { employeesApi } from '../api'
import type { EmployeeInput } from '../api/types'
import { EmployeeForm } from '../components/employees/EmployeeForm'
import { PageHeader, useToast } from '../components/ui'
import { useDepartments } from '../hooks/useDepartments'

export function EmployeeNewPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { departments } = useDepartments()

  const handleSubmit = async (values: EmployeeInput) => {
    const created = await employeesApi.create(values)
    toast(`${created.fullName} was added.`)
    navigate('/employees', { replace: true })
  }

  return (
    <>
      <PageHeader
        breadcrumb={
          <>
            <Link to="/employees" className="text-slate-500 transition hover:text-brand-600">
              Employees
            </Link>
            <span className="px-1.5 text-slate-300">/</span>
            <span className="text-slate-600">New</span>
          </>
        }
        title="Add employee"
        description="Create a new employee record."
        onBack={() => navigate('/employees')}
      />
      <EmployeeForm
        departments={departments}
        submitLabel="Create employee"
        onSubmit={handleSubmit}
        onCancel={() => navigate('/employees')}
      />
    </>
  )
}
