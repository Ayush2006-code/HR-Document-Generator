import { Menu, Sun, Moon, Plus, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Topbar({ onMenuClick, title }) {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <header className="relative z-20 flex h-[76px] shrink-0 items-center gap-3 bg-white px-4 dark:bg-slate-950 md:px-7">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white md:hidden"
        aria-label="Open menu"
        type="button"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white md:text-base">
            {title}
          </h1>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/')}
          className="group hidden h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/25 sm:flex"
          type="button"
        >
          <Plus
            size={16}
            strokeWidth={2.3}
            className="transition-transform duration-200 group-hover:rotate-90"
          />

          <span>New Document</span>
        </button>

        <button
          onClick={() => navigate('/')}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/15 sm:hidden"
          aria-label="New document"
          type="button"
        >
          <Plus size={18} strokeWidth={2.2} />
        </button>

        <button
          onClick={toggleTheme}
          aria-label={
            theme === 'dark'
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
          className="group flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          type="button"
        >
          {theme === 'dark' ? (
            <Sun
              size={17}
              className="transition-transform duration-300 group-hover:rotate-45"
            />
          ) : (
            <Moon
              size={17}
              className="transition-transform duration-300 group-hover:-rotate-12"
            />
          )}
        </button>
      </div>
    </header>
  )
}