'use client'

import { celebration } from '@/lib/celebration'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

import { type Remote, SyncedSet } from './synced-set'

const year = celebration.year

function client() {
	const supabase = getSupabaseBrowserClient()
	if (!supabase) throw new Error('Supabase is not configured')
	return supabase
}

const favoritesRemote: Remote = {
	async fetch(userId) {
		const { data, error } = await client()
			.from('favorites')
			.select('event_id')
			.eq('user_id', userId)
			.eq('show_year', year)
			.order('created_at')
		if (error) throw error
		return data.map(r => r.event_id)
	},
	async add(userId, ids) {
		const { error } = await client()
			.from('favorites')
			.upsert(
				ids.map(event_id => ({ user_id: userId, show_year: year, event_id })),
				{ onConflict: 'user_id,show_year,event_id', ignoreDuplicates: true }
			)
		if (error) throw error
	},
	async remove(userId, ids) {
		const { error } = await client().from('favorites').delete().eq('user_id', userId).eq('show_year', year).in('event_id', ids)
		if (error) throw error
	},
}

const vendorBookmarksRemote: Remote = {
	async fetch(userId) {
		const { data, error } = await client()
			.from('vendor_bookmarks')
			.select('vendor_id')
			.eq('user_id', userId)
			.eq('show_year', year)
			.order('created_at')
		if (error) throw error
		return data.map(r => r.vendor_id)
	},
	async add(userId, ids) {
		const { error } = await client()
			.from('vendor_bookmarks')
			.upsert(
				ids.map(vendor_id => ({ user_id: userId, show_year: year, vendor_id })),
				{ onConflict: 'user_id,show_year,vendor_id', ignoreDuplicates: true }
			)
		if (error) throw error
	},
	async remove(userId, ids) {
		const { error } = await client()
			.from('vendor_bookmarks')
			.delete()
			.eq('user_id', userId)
			.eq('show_year', year)
			.in('vendor_id', ids)
		if (error) throw error
	},
}

// Keys unchanged from the device-only version, so existing saves carry over.
export const favoritesStore = new SyncedSet(`${celebration.storagePrefix}.favorites`, favoritesRemote)
export const vendorBookmarksStore = new SyncedSet(`${celebration.storagePrefix}.vendorBookmarks`, vendorBookmarksRemote)

export const allStores = [favoritesStore, vendorBookmarksStore] as const
