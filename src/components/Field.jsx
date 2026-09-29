export default function Field({
  label,
  error,
  required,
  children,
  hint,
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label}
        {required && (
          <span className="ml-0.5 text-rose-500">
            *
          </span>
        )}
      </label>

      {children}

      {hint && !error && (
        <p className="mt-1.5 text-[11px] leading-5 text-slate-400 dark:text-slate-500">
          {hint}
        </p>
      )}

      {error && (
        <p className="mt-1.5 text-[11px] font-medium leading-5 text-rose-500">
          {error}
        </p>
      )}
    </div>
  )
}

export function inputClass(hasError) {
  return [
    'w-full rounded-xl px-3.5 py-2.5',
    'bg-white dark:bg-slate-900',
    'text-sm text-slate-900 dark:text-white',
    'placeholder:text-slate-400 dark:placeholder:text-slate-600',
    'outline-none transition-all duration-150',
    'shadow-sm',
    hasError
      ? 'ring-1 ring-rose-400 focus:ring-2 focus:ring-rose-400/30'
      : 'ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500/30 dark:ring-slate-800',
    'disabled:cursor-not-allowed disabled:opacity-60',
  ].join(' ')
}