import { useState } from 'react'
import { AlertCircle, Plus, UserCog } from 'lucide-react'
import { Avatar, Button, EmptyState, PageHeader, Skeleton, useToast } from '../components/ui'
import { CreateAdminDialog } from '../components/admins/CreateAdminDialog'
import { useAdmins } from '../hooks/useAdmins'
import { useAuth } from '../context/auth-context'
import { formatDate } from '../lib/format'

export function AdminsPage() {
  const { admin: current } = useAuth()
  const { toast } = useToast()
  const { admins, loading, error, reload } = useAdmins()
  const [creating, setCreating] = useState(false)

  const handleCreated = (name: string) => {
    setCreating(false)
    toast(`${name} was added as an admin.`)
    reload()
  }

  return (
    <>
      <PageHeader
        title="Admins"
        description="Manage who can sign in and manage employee records."
        actions={
          <Button
            icon={<Plus className="size-4" aria-hidden="true" />}
            onClick={() => setCreating(true)}
          >
            New admin
          </Button>
        }
      />

      <div className="card overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex items-center gap-3 px-4 py-3.5">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5" style={{ width: '30%' }} />
                  <Skeleton className="h-3" style={{ width: '45%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={<AlertCircle className="size-5" aria-hidden="true" />}
            title="Couldn't load admins"
            description={error}
            action={
              <Button variant="secondary" onClick={reload}>
                Try again
              </Button>
            }
          />
        ) : admins.length === 0 ? (
          <EmptyState
            icon={<UserCog className="size-5" aria-hidden="true" />}
            title="No admins yet"
            description="Create an admin account to give someone access."
            action={
              <Button
                icon={<Plus className="size-4" aria-hidden="true" />}
                onClick={() => setCreating(true)}
              >
                New admin
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {admins.map((admin) => (
              <li key={admin.id} className="flex items-center gap-3 px-4 py-3.5">
                <Avatar name={admin.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <span className="truncate">{admin.name}</span>
                    {admin.id === current?.id && (
                      <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                        You
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-slate-500">{admin.email}</p>
                </div>
                <span className="hidden shrink-0 text-xs text-slate-400 sm:block">
                  Added {formatDate(admin.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CreateAdminDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={handleCreated}
      />
    </>
  )
}
