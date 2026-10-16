import { Eye, Pencil, Trash2 } from 'lucide-react'
import type { Employee } from '../../api/types'
import { formatCurrency, formatDate } from '../../lib/format'
import { Avatar } from '../ui'
import { StatusBadge } from './StatusBadge'

interface EmployeeTableProps {
  employees: Employee[]
  onView: (employee: Employee) => void
  onEdit: (employee: Employee) => void
  onDelete: (employee: Employee) => void
}

const headCell = 'px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500'

function IconAction({
  label,
  onClick,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  onClick: () => void
  icon: typeof Eye
  tone?: 'default' | 'danger'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={
        tone === 'danger'
          ? 'inline-flex size-7 items-center justify-center rounded-md text-slate-400 outline-none transition hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500/40'
          : 'inline-flex size-7 items-center justify-center rounded-md text-slate-400 outline-none transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-brand-500/40'
      }
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  )
}

function EmployeeCell({ employee }: { employee: Employee }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={employee.fullName} size="sm" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-slate-900">{employee.fullName}</span>
        <span className="block truncate text-xs text-slate-500">{employee.email}</span>
      </span>
    </div>
  )
}

export function EmployeeTable({ employees, onView, onEdit, onDelete }: EmployeeTableProps) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className={headCell}>Employee</th>
              <th className={headCell}>ID</th>
              <th className={headCell}>Role</th>
              <th className={headCell}>Joined</th>
              <th className={`${headCell} text-right`}>Salary</th>
              <th className={headCell}>Status</th>
              <th
                className={`${headCell} sticky right-0 border-l border-slate-200 bg-slate-50 text-right`}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr
                key={employee.id}
                className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50"
              >
                <td className="px-3 py-3">
                  <EmployeeCell employee={employee} />
                </td>
                <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-slate-600">
                  {employee.empId}
                </td>
                <td className="px-3 py-3">
                  <span className="block text-sm text-slate-700">{employee.designation}</span>
                  <span className="block text-xs text-slate-500">
                    {employee.departmentName ?? '-'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm tabular-nums text-slate-600">
                  {formatDate(employee.dateOfJoining)}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right text-sm tabular-nums text-slate-600">
                  {formatCurrency(employee.salary)}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={employee.status} />
                </td>
                <td className="sticky right-0 border-l border-slate-100 bg-white px-3 py-3 group-hover:bg-slate-50">
                  <div className="flex items-center justify-end gap-0.5">
                    <IconAction label="View details" icon={Eye} onClick={() => onView(employee)} />
                    <IconAction label="Edit employee" icon={Pencil} onClick={() => onEdit(employee)} />
                    <IconAction
                      label="Delete employee"
                      icon={Trash2}
                      tone="danger"
                      onClick={() => onDelete(employee)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {employees.map((employee) => (
          <div key={employee.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <EmployeeCell employee={employee} />
              <StatusBadge status={employee.status} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <dt className="text-slate-400">Employee ID</dt>
                <dd className="font-mono text-slate-700">{employee.empId}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Department</dt>
                <dd className="text-slate-700">{employee.departmentName ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Designation</dt>
                <dd className="text-slate-700">{employee.designation}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Joined</dt>
                <dd className="tabular-nums text-slate-700">{formatDate(employee.dateOfJoining)}</dd>
              </div>
            </dl>
            <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => onView(employee)}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-600 outline-none transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500/40"
              >
                <Eye className="size-3.5" aria-hidden="true" /> View
              </button>
              <button
                type="button"
                onClick={() => onEdit(employee)}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-600 outline-none transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500/40"
              >
                <Pencil className="size-3.5" aria-hidden="true" /> Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(employee)}
                className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-red-600 outline-none transition hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500/40"
              >
                <Trash2 className="size-3.5" aria-hidden="true" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
