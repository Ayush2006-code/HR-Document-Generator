import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  History,
  FileStack,
  Settings,
  FileSignature,
  X,
  LogOut,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/employees',
    label: 'Employees',
    icon: Users,
  },
  {
    to: '/history',
    label: 'Document History',
    icon: History,
  },
  {
    to: '/templates',
    label: 'Templates',
    icon: FileStack,
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: Settings,
  },
]

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  async function handleLogout() {
    if (signingOut) return

    setSigningOut(true)

    try {
      await logout()
      onClose?.()
      navigate('/login', { replace: true })
    } catch {
      setSigningOut(false)
    }
  }

  const email = user?.email || ''
  const emailInitial = email
    ? email.charAt(0).toUpperCase()
    : 'U'

  const content = (
    <div className="flex h-full min-h-0 flex-col bg-white dark:bg-slate-950">
      {/* Brand */}
      <div className="flex h-[76px] shrink-0 items-center border-b border-slate-100 px-6 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <FileSignature
              size={20}
              strokeWidth={2}
            />
          </div>

          <div>
            <div className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
              HR Docs
            </div>

            <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
              Workspace
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 md:hidden"
          aria-label="Close menu"
          type="button"
        >
          <X size={19} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-4 py-7">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Workspace
        </p>

        <div className="space-y-1.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'group flex min-h-[46px] items-center gap-3 rounded-xl px-3.5 text-[13px] font-medium transition-all duration-200',
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={[
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                        : 'bg-transparent text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200',
                    ].join(' ')}
                  >
                    <item.icon
                      size={17}
                      strokeWidth={isActive ? 2.2 : 1.9}
                    />
                  </span>

                  <span className="flex-1">
                    {item.label}
                  </span>

                  <ChevronRight
                    size={15}
                    className={[
                      'transition-all duration-200',
                      isActive
                        ? 'translate-x-0 text-blue-500 opacity-100'
                        : '-translate-x-1 text-slate-300 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 dark:text-slate-600',
                    ].join(' ')}
                  />
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Account */}
      <div className="shrink-0 border-t border-slate-100 px-4 pb-5 pt-4 dark:border-slate-800">
        <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-900">
          {email && (
            <div className="mb-3.5 flex items-center gap-3 px-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                {emailInitial}
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Signed in
                </p>

                <p
                  className="mt-0.5 truncate text-xs font-medium text-slate-700 dark:text-slate-200"
                  title={email}
                >
                  {email}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            disabled={signingOut}
            className="flex min-h-[40px] w-full items-center gap-3 rounded-xl px-3 text-[13px] font-medium text-slate-500 transition-all hover:bg-white hover:text-rose-600 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-slate-800 dark:hover:text-rose-400"
            type="button"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-400 dark:bg-slate-800">
              {signingOut ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <LogOut size={15} />
              )}
            </span>

            <span>
              {signingOut
                ? 'Signing out...'
                : 'Log out'}
            </span>
          </button>
        </div>

        <div className="px-2 pt-4 text-[10px] font-medium text-slate-400">
          <span>HR Document Generator</span>
          <span className="mx-1.5">•</span>
          <span>v1.0</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-[272px] shrink-0 border-r border-slate-100 md:block dark:border-slate-800">
        {content}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <aside className="absolute bottom-0 left-0 top-0 w-[290px] shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  )
}