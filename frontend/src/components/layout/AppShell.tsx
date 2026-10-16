import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Menu, UserCog, Users, X, Building2 } from 'lucide-react'
import { useAuth } from '../../context/auth-context'
import { Avatar } from '../ui'
import { cn } from '../../lib/cn'

const navItems = [
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/departments', label: 'Departments', icon: Building2 },
  { to: '/admins', label: 'Admins', icon: UserCog },
]

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white">
        K
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-slate-900">Kloudspot</span>
        <span className="block text-xs text-slate-500">Employee Admin</span>
      </span>
    </div>
  )
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
      <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Management
      </p>
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500/40',
              isActive
                ? "bg-brand-50 text-brand-700 before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-brand-600 before:content-['']"
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )
          }
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

function UserCard() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  if (!admin) return null

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="border-t border-slate-200 p-3">
      <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
        <Avatar name={admin.name} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-slate-800">{admin.name}</p>
          <p className="truncate text-[11px] text-slate-500">{admin.email}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          title="Sign out"
          aria-label="Sign out"
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-slate-400 outline-none transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-brand-500/40"
        >
          <LogOut className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

function UserMenu() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  if (!admin) return null

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="relative lg:hidden" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 outline-none transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500/40"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={admin.name} size="md" />
        <span className="hidden text-left sm:block">
          <span className="block text-xs font-medium leading-4 text-slate-800">{admin.name}</span>
          <span className="block text-[11px] leading-4 text-slate-500">{admin.email}</span>
        </span>
        <ChevronDown className="size-3.5 text-slate-400" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-1.5 w-56 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg"
        >
          <div className="border-b border-slate-100 px-3 py-2 sm:hidden">
            <p className="text-xs font-medium text-slate-800">{admin.name}</p>
            <p className="text-[11px] text-slate-500">{admin.email}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-600 outline-none transition hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-52 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-14 items-center border-b border-slate-200 px-4">
          <BrandMark />
        </div>
        <SidebarNav />
        <UserCard />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-56 flex-col bg-white shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
              <BrandMark />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1.5 text-slate-400 outline-none transition hover:bg-slate-100 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-brand-500/40"
                aria-label="Close navigation"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
            <UserCard />
          </aside>
        </div>
      )}

      <div className="lg:pl-52">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-slate-500 outline-none transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500/40 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <div className="hidden text-sm text-slate-500 lg:block">
            Employee Management
          </div>
          <UserMenu />
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
