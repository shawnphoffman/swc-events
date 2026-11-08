import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'

import { celebration } from '@/lib/celebration'
import { accountsEnabled } from '@/lib/supabase/env'
import { createSupabasePublicClient } from '@/lib/supabase/server'

export type PublicProfile = { handle: string; displayName: string | null; eventIds: string[] }

/** A public profile and its saved events for this show, or null if it doesn't exist or is private. */
export async function getPublicProfile(handle: string): Promise<PublicProfile | null> {
	'use cache'
	cacheTag(`profile:${handle}`)
	cacheLife({ stale: 60, revalidate: 120, expire: 3600 })

	if (!accountsEnabled || !/^[a-z0-9][a-z0-9-]{2,29}$/.test(handle)) return null
	const supabase = createSupabasePublicClient()
	// RLS only returns profiles with is_public = true to anonymous readers.
	const { data: profile, error } = await supabase.from('profiles').select('id, handle, display_name').eq('handle', handle).maybeSingle()
	if (error) throw error
	if (!profile?.handle) return null

	const { data: rows, error: favError } = await supabase
		.from('favorites')
		.select('event_id')
		.eq('user_id', profile.id)
		.eq('show_year', celebration.year)
		.order('created_at')
	if (favError) throw favError
	return { handle: profile.handle, displayName: profile.display_name, eventIds: rows.map(r => r.event_id) }
}
