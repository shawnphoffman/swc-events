/**
 * Public Supabase settings (safe to ship to the browser; row level security guards the data).
 * When unset (e.g. a preview without the integration), account features hide themselves
 * and the app falls back to device-only favorites.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ''
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

/**
 * Whether sign-in, sync and public profiles are offered. `NEXT_PUBLIC_ACCOUNTS=off` hides them
 * while the database stays connected (the keep-alive cron still runs), so a deployment can go
 * live before the sign-in providers are configured. Inlined at build time: redeploy after changing it.
 */
export const accountsEnabled = isSupabaseConfigured && process.env.NEXT_PUBLIC_ACCOUNTS !== 'off'
