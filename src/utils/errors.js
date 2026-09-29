// Central error-handling helper (FIX #18).
//
// `AppError` marks a message that is already safe and useful to show a
// normal HR user as-is (e.g. "Employee name is required.",
// "Some document fields are not populated."). Anything else — a raw
// exception from a browser API, a library bug, a network hiccup — is
// treated as unexpected: the real error and its stack are still logged to
// the console in development so a developer can fix it, but the person
// using the app only ever sees a short, calm, non-technical message.
// Nothing here ever logs employee names, salary figures, or other personal
// data — only the error's own message/stack.

export class AppError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AppError'
    this.isAppError = true
  }
}

const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV

/**
 * Returns a message safe to show the user. Known/expected errors (AppError,
 * or anything already thrown with a clear message by this app's own
 * services) pass through unchanged; anything else is replaced with
 * `fallback` so a raw stack trace or browser-internal message never reaches
 * the screen. The original error is always logged to the console in dev.
 */
export function describeError(err, fallback = 'Something went wrong. Please try again.') {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.error(err)
  }
  if (!err) return fallback
  if (err.isAppError) return err.message
  // Errors thrown intentionally by this app's own services (templateProcessor,
  // documentGenerator, salaryCalculator, etc.) always have a short, specific,
  // human-readable message with no stack-trace-style content — safe to show.
  if (typeof err.message === 'string' && err.message.length > 0 && err.message.length < 300 && !/\bat\s+\S+\s+\(/.test(err.message)) {
    return err.message
  }
  return fallback
}
