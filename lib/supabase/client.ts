'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from './database.types'
import { accountsEnabled, supabasePublishableKey, supabaseUrl } from './env'

let client: SupabaseClient<Database> | null = null

/** Browser client (session in cookies, so the OAuth callback route can complete PKCE). Null when not configured. */
export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
	if (!accountsEnabled || typeof window === 'undefined') return null
	client ??= createBrowserClient<Database>(supabaseUrl, supabasePublishableKey)
	return client
}
