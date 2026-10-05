import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

import type { Database } from './database.types'
import { supabasePublishableKey, supabaseUrl } from './env'

/** Request-scoped client that reads and writes the auth cookies. Used by the OAuth callback. */
export async function createSupabaseServerClient() {
	const cookieStore = await cookies()
	return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
		cookies: {
			getAll: () => cookieStore.getAll(),
			setAll: toSet => {
				for (const { name, value, options } of toSet) cookieStore.set(name, value, options)
			},
		},
	})
}

/** Session-less client for public, cacheable reads (public profiles, keep-alive). */
export function createSupabasePublicClient() {
	return createClient<Database>(supabaseUrl, supabasePublishableKey, {
		auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
	})
}
