import { Building2, UserCheck, UserX, Users, type LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  tone: 'brand' | 'emerald' | 'slate'
  loading: boolean
}

const tones = {
  brand: 'bg-brand-50 text-brand-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  slate: 'bg-slate-100 text-slate-500',
}

function StatCard({ label, value, icon: Icon, tone, loading }: StatCardProps) {
  return (
    <div className="card flex items-center gap-3.5 p-4">
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        {loading ? (
          <span className="mt-1 block h-5 w-10 animate-pulse rounded bg-slate-200/70" />
        ) : (
          <p className="text-lg font-semibold tabular-nums text-slate-900">{value}</p>
        )}
      </div>
    </div>
  )
}

interface EmployeeStatsProps {
  total: number
  active: number
  inactive: number
  departments: number
  loading: boolean
}

export function EmployeeStats({ total, active, inactive, departments, loading }: EmployeeStatsProps) {
  return (
    <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Total employees" value={total} icon={Users} tone="brand" loading={loading} />
      <StatCard label="Active" value={active} icon={UserCheck} tone="emerald" loading={loading} />
      <StatCard label="Inactive" value={inactive} icon={UserX} tone="slate" loading={loading} />
      <StatCard label="Departments" value={departments} icon={Building2} tone="brand" loading={loading} />
    </div>
  )
}
