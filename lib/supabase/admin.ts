import 'server-only'

import { createClient } from '@supabase/supabase-js'

import type { Database } from './database.types'
import { supabaseUrl } from './env'

/**
 * Privileged client (bypasses row level security). Server-only; used solely for
 * account deletion. Null when SUPABASE_SECRET_KEY isn't configured.
 */
export function createSupabaseAdminClient() {
	const secret = process.env.SUPABASE_SECRET_KEY
	if (!supabaseUrl || !secret) return null
	return createClient<Database>(supabaseUrl, secret, {
		auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
	})
}
