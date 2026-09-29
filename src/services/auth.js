// Thin wrapper around Supabase Auth. AuthContext.jsx is the only caller for
// now (login/register/logout/getSession/updateProfile) — Login.jsx and
// Signup.jsx go through AuthContext, never through this file directly.
//
// Every function here either returns a small, consistent "session user"
// shape — { userId, name, email } — or null, or throws a plain Error whose
// .message is safe to show directly in the UI (Login.jsx/Signup.jsx both
// render err.message as-is). Supabase's own error messages are already
// user-appropriate ("Invalid login credentials", etc.), so they're passed
// through rather than replaced.
//
// Privacy: nothing here ever logs an email, password, or session token to
// the console.
import { supabase } from './supabaseClient.js'

function mapUser(user) {
  if (!user) return null
  return {
    userId: user.id,
    name: user.user_metadata?.name || '',
    email: user.email || '',
  }
}

/** Current session's user, or null if signed out. Called once on app start
 * by AuthContext; also re-derived from onAuthStateChange after that. */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw new Error(error.message)
  return mapUser(data.session?.user)
}

/** @param {{email: string, password: string}} credentials */
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return mapUser(data.user)
}

/**
 * @param {{name: string, email: string, password: string, confirmPassword?: string}} payload
 * @returns the new user if Supabase returned an active session immediately
 *   (email confirmation disabled), or null if it did NOT (email
 *   confirmation is required before the account can sign in) — the caller
 *   (AuthContext.register, then Signup.jsx) uses this to decide whether to
 *   redirect straight to the dashboard or show a "check your email" message.
 */
export async function signUp({ name, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })
  if (error) throw new Error(error.message)
  // With email confirmation ON, Supabase returns a user but no session.
  // With it OFF (or auto-confirmed), a session comes back immediately.
  if (data.session) return mapUser(data.user)
  return null
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

/**
 * Updates the CURRENTLY signed-in user's profile metadata (e.g. { name }).
 * `userId` is accepted to match the shape AuthContext/callers already use,
 * but Supabase's client-side auth API can only ever update the user
 * attached to the current session — it is not usable to edit another
 * user's profile, by design.
 */
// eslint-disable-next-line no-unused-vars
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase.auth.updateUser({ data: updates })
  if (error) throw new Error(error.message)
  return mapUser(data.user)
}

/**
 * Simple, dependency-free password strength check for the Signup form.
 * Returns a score 0-4 and a short label; not currently wired into the UI
 * (Signup.jsx only enforces the 8-character minimum today) but available
 * for a future stronger-password hint without adding a library.
 */
export function passwordStrength(password) {
  const value = password || ''
  let score = 0
  if (value.length >= 8) score += 1
  if (value.length >= 12) score += 1
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1
  if (/\d/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1
  score = Math.min(score, 4)
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong']
  return { score, label: labels[score] }
}

/**
 * Sends a Supabase password-reset email. `redirectTo` defaults to this
 * app's own /login page so the reset link lands back in the app; pass a
 * different path if a dedicated "set new password" page is added later.
 */
export async function requestPasswordReset(email, redirectTo = `${window.location.origin}/login`) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  if (error) throw new Error(error.message)
}
