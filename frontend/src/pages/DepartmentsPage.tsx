import { useState } from 'react'
import { AlertCircle, Building2, Plus } from 'lucide-react'
import { Button, EmptyState, PageHeader, Skeleton, useToast } from '../components/ui'
import { CreateDepartmentDialog } from '../components/departments/CreateDepartmentDialog'
import { useDepartments } from '../hooks/useDepartments'
import type { Department } from '../api/types'

export function DepartmentsPage() {
  const { toast } = useToast()
  const { departments, loading, error, reload } = useDepartments()
  const [creating, setCreating] = useState(false)

  const handleCreated = (department: Department) => {
    setCreating(false)
    toast(`${department.name} was added as a department.`)
    reload()
  }

  return (
    <>
      <PageHeader
        title="Departments"
        description="Organise employees into departments."
        actions={
          <Button
            icon={<Plus className="size-4" aria-hidden="true" />}
            onClick={() => setCreating(true)}
          >
            New department
          </Button>
        }
      />

      <div className="card overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="flex items-center gap-3 px-4 py-3.5">
                <Skeleton className="size-9 shrink-0 rounded-md" />
                <Skeleton className="h-3.5" style={{ width: '35%' }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={<AlertCircle className="size-5" aria-hidden="true" />}
            title="Couldn't load departments"
            description={error}
            action={
              <Button variant="secondary" onClick={reload}>
                Try again
              </Button>
            }
          />
        ) : departments.length === 0 ? (
          <EmptyState
            icon={<Building2 className="size-5" aria-hidden="true" />}
            title="No departments yet"
            description="Create a department before adding employees."
            action={
              <Button
                icon={<Plus className="size-4" aria-hidden="true" />}
                onClick={() => setCreating(true)}
              >
                New department
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {departments.map((department) => (
              <li key={department.id} className="flex items-center gap-3 px-4 py-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                  <Building2 className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                  {department.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CreateDepartmentDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={handleCreated}
      />
    </>
  )
}
