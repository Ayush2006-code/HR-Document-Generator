import { useEffect, useRef, useState } from 'react'
import {
  Menu,
  Sun,
  Moon,
  Plus,
  FileSignature,
  ClipboardCheck,
  Wallet,
  Layers,
  ChevronDown,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'

const DOCUMENT_OPTIONS = [
  {
    to: '/generate/offer-letter',
    icon: FileSignature,
    title: 'Offer Letter',
    description: 'Create a new offer letter',
  },
  {
    to: '/generate/appointment-letter',
    icon: ClipboardCheck,
    title: 'Appointment Letter',
    description: 'Create an appointment letter',
  },
  {
    to: '/generate/salary-slip',
    icon: Wallet,
    title: 'Salary Slip',
    description: 'Create a monthly salary slip',
  },
  {
    to: '/generate/all',
    icon: Layers,
    title: 'Generate All',
    description: 'Create all documents together',
  },
]

export default function Topbar({ onMenuClick, title }) {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      )
      document.removeEventListener(
        'keydown',
        handleEscape
      )
    }
  }, [])

  function handleDocumentSelect(path) {
    setIsOpen(false)
    navigate(path)
  }

  return (
    <header className="relative z-30 flex h-[76px] shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white px-4 dark:border-slate-800 dark:bg-slate-950 md:px-7">
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
        {/* Desktop New Document */}
        <div
          ref={menuRef}
          className="relative hidden sm:block"
        >
          <button
            onClick={() => setIsOpen((current) => !current)}
            className="group flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/25"
            type="button"
            aria-haspopup="menu"
            aria-expanded={isOpen}
          >
            <Plus
              size={16}
              strokeWidth={2.3}
              className="transition-transform duration-200 group-hover:rotate-90"
            />

            <span>New Document</span>

            <ChevronDown
              size={14}
              className={`ml-0.5 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-[calc(100%+10px)] w-[310px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">
              <div className="px-3 pb-2 pt-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                  Create document
                </p>
              </div>

              <div className="space-y-1">
                {DOCUMENT_OPTIONS.map((option) => {
                  const Icon = option.icon

                  return (
                    <button
                      key={option.to}
                      type="button"
                      onClick={() =>
                        handleDocumentSelect(option.to)
                      }
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/10 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                        <Icon size={17} strokeWidth={2} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {option.title}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Mobile New Document */}
        <div
          ref={!menuRef.current ? menuRef : undefined}
          className="relative sm:hidden"
        >
          <button
            onClick={() => setIsOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/15"
            aria-label="New document"
            aria-haspopup="menu"
            aria-expanded={isOpen}
            type="button"
          >
            <Plus
              size={18}
              strokeWidth={2.2}
              className={`transition-transform duration-200 ${
                isOpen ? 'rotate-45' : ''
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[290px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">
              {DOCUMENT_OPTIONS.map((option) => {
                const Icon = option.icon

                return (
                  <button
                    key={option.to}
                    type="button"
                    onClick={() =>
                      handleDocumentSelect(option.to)
                    }
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                      <Icon size={17} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {option.title}
                      </p>

                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {option.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Theme */}
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