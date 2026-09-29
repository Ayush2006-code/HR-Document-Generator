export default function EmptyState({
  icon: Icon,
  title,
  body,
}) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-12 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <Icon size={21} strokeWidth={1.8} />
        </div>
      )}

      <h3 className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-200">
        {title}
      </h3>

      {body && (
        <p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-400 dark:text-slate-500">
          {body}
        </p>
      )}
    </div>
  )
}