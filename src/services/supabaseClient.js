import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

// Support both the current Supabase publishable key name
// and the older anon-key environment variable name.
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY

const PLACEHOLDER_VALUES = new Set([
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY',
  'YOUR_SUPABASE_PUBLISHABLE_KEY',
  '',
  undefined,
  null,
])

export const isSupabaseConfigured =
  !PLACEHOLDER_VALUES.has(supabaseUrl) &&
  !PLACEHOLDER_VALUES.has(supabaseKey)

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    '[supabaseClient] Supabase environment variables are missing or still placeholders. ' +
      'Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.invalid',
  supabaseKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)