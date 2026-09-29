import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ClipboardCheck,
  FileSignature,
  Layers,
  Wallet,
} from 'lucide-react'

const CARDS = [
  {
    to: '/generate/offer',
    icon: FileSignature,
    title: 'Offer Letter',
    body: 'Generate an offer letter with its salary Annexure filled in automatically.',
  },
  {
    to: '/generate/appointment',
    icon: ClipboardCheck,
    title: 'Appointment Letter',
    body: 'Generate an appointment letter with its salary Annexure-I filled in automatically.',
  },
  {
    to: '/generate/salary-slip',
    icon: Wallet,
    title: 'Salary Slip',
    body: 'Generate a standalone monthly salary slip — no offer or appointment letter required first.',
  },
]

export default function DocumentSelector() {
  const navigate = useNavigate()

  return (
    <div>
      {/* Document options */}
      <div className="grid gap-4 sm:grid-cols-3">
        {CARDS.map((card) => {
          const Icon = card.icon

          return (
            <button
              key={card.to}
              type="button"
              onClick={() => navigate(card.to)}
              className="group relative flex min-h-[210px] flex-col items-start justify-between overflow-hidden rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-200/70 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 dark:bg-slate-900 dark:ring-slate-800 dark:hover:shadow-black/20"
            >
              {/* Subtle hover glow */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-500/5 blur-2xl transition-all duration-300 group-hover:bg-blue-500/10" />

              <div>
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/10 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                  <Icon size={20} strokeWidth={2} />
                </div>

                <h3 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
                  {card.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {card.body}
                </p>
              </div>

              <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition-all duration-200 group-hover:gap-2.5 dark:text-blue-400">
                Create document
                <ArrowRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </div>
            </button>
          )
        })}
      </div>

      {/* Generate all */}
      <button
        type="button"
        onClick={() => navigate('/generate/all')}
        className="group mt-4 flex w-full items-center justify-between rounded-2xl bg-slate-900 px-5 py-4 text-left text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:bg-white dark:text-slate-900"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 dark:bg-slate-900/10">
            <Layers size={17} />
          </div>

          <div>
            <p className="text-sm font-semibold">
              Generate all documents
            </p>

            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              Create offer letter, appointment letter and salary slip together.
            </p>
          </div>
        </div>

        <ArrowRight
          size={18}
          className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
        />
      </button>
    </div>
  )
}