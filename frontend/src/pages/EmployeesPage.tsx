import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Download, Plus, UserX, Users } from 'lucide-react'
import { employeesApi } from '../api'
import type { Employee } from '../api/types'
import { Button, EmptyState, PageHeader, Pagination, TableSkeleton, useToast } from '../components/ui'
import { EmployeeFilters } from '../components/employees/EmployeeFilters'
import { EmployeeTable } from '../components/employees/EmployeeTable'
import { EmployeeStats } from '../components/employees/EmployeeStats'
import { DeleteEmployeeDialog } from '../components/employees/DeleteEmployeeDialog'
import { useDebounce } from '../hooks/useDebounce'
import { useDepartments } from '../hooks/useDepartments'
import { useEmployees } from '../hooks/useEmployees'
import { useEmployeeStats } from '../hooks/useEmployeeStats'

type StatusFilter = '' | 'active' | 'inactive'

export function EmployeesPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { departments } = useDepartments()

  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState<StatusFilter>('')
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)

  const debouncedSearch = useDebounce(search, 350)

  const params = useMemo(
    () => ({ page, size, search: debouncedSearch, department, status }),
    [page, size, debouncedSearch, department, status],
  )

  const { data, total, loading, error, reload } = useEmployees(params)
  const stats = useEmployeeStats()

  const [pendingDelete, setPendingDelete] = useState<Employee | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)

  const hasFilters = Boolean(search || department || status)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleDepartmentChange = (value: string) => {
    setDepartment(value)
    setPage(1)
  }

  const handleStatusChange = (value: StatusFilter) => {
    setStatus(value)
    setPage(1)
  }

  const handleSizeChange = (value: number) => {
    setSize(value)
    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setDepartment('')
    setStatus('')
    setPage(1)
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await employeesApi.remove(pendingDelete.id)
      toast(`${pendingDelete.fullName} was removed.`)
      setPendingDelete(null)
      stats.refresh()
      if (data.length === 1 && page > 1) setPage((current) => current - 1)
      else reload()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to delete employee', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await employeesApi.exportCsv({ search: debouncedSearch, department, status })
      toast('Employee list exported.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Export failed', 'error')
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Employees"
        description="Add, edit and manage employee records."
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Download className="size-4" aria-hidden="true" />}
              onClick={handleExport}
              loading={exporting}
            >
              Export
            </Button>
            <Button
              icon={<Plus className="size-4" aria-hidden="true" />}
              onClick={() => navigate('/employees/new')}
            >
              Add employee
            </Button>
          </>
        }
      />

      <EmployeeStats
        total={stats.total}
        active={stats.active}
        inactive={stats.inactive}
        departments={departments.length}
        loading={stats.loading}
      />

      <div className="card overflow-hidden">
        <EmployeeFilters
          search={search}
          onSearchChange={handleSearchChange}
          department={department}
          onDepartmentChange={handleDepartmentChange}
          status={status}
          onStatusChange={handleStatusChange}
          departments={departments}
          onClear={clearFilters}
        />

        {loading ? (
          <TableSkeleton rows={size > 10 ? 10 : size} />
        ) : error ? (
          <EmptyState
            icon={<AlertCircle className="size-5" aria-hidden="true" />}
            title="Couldn't load employees"
            description={error}
            action={<Button variant="secondary" onClick={reload}>Try again</Button>}
          />
        ) : data.length === 0 ? (
          <EmptyState
            icon={hasFilters ? <UserX className="size-5" aria-hidden="true" /> : <Users className="size-5" aria-hidden="true" />}
            title={hasFilters ? 'No matching employees' : 'No employees yet'}
            description={
              hasFilters
                ? 'No employees match the current search or filters.'
                : 'Add your first employee to get started.'
            }
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => navigate('/employees/new')}>
                  Add employee
                </Button>
              )
            }
          />
        ) : (
          <>
            <EmployeeTable
              employees={data}
              onView={(employee) => navigate(`/employees/${employee.id}`)}
              onEdit={(employee) => navigate(`/employees/${employee.id}/edit`)}
              onDelete={setPendingDelete}
            />
            <Pagination
              page={page}
              size={size}
              total={total}
              onPageChange={setPage}
              onSizeChange={handleSizeChange}
            />
          </>
        )}
      </div>

      <DeleteEmployeeDialog
        employee={pendingDelete}
        deleting={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}
