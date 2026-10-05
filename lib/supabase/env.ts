/**
 * Public Supabase settings (safe to ship to the browser; row level security guards the data).
 * When unset (e.g. a preview without the integration), account features hide themselves
 * and the app falls back to device-only favorites.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ''
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)
