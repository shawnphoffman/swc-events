'use client'

import { useCallback, useSyncExternalStore } from 'react'

import { favoritesStore, vendorBookmarksStore } from '@/lib/sync/stores'
import type { SyncedSet } from '@/lib/sync/synced-set'

const EMPTY: readonly string[] = Object.freeze([])
const getServerSnapshot = () => EMPTY
const getServerStatus = () => 'local' as const

function useSyncedSet(store: SyncedSet) {
	const ids = useSyncExternalStore(store.subscribe, store.getIds, getServerSnapshot)
	const status = useSyncExternalStore(store.subscribe, store.getStatus, getServerStatus)

	const has = useCallback((id: string) => ids.includes(id), [ids])
	const toggle = useCallback((id: string) => store.toggle(id), [store])
	const addMany = useCallback((add: string[]) => store.addMany(add), [store])
	const removeMany = useCallback((remove: string[]) => store.removeMany(remove), [store])

	return { ids, status, has, toggle, addMany, removeMany }
}

/** Saved events. Local-first; synced to the account when signed in. */
export const useFavorites = () => useSyncedSet(favoritesStore)
/** Vendor bookmarks. Local-first; synced to the account when signed in. */
export const useVendorBookmarks = () => useSyncedSet(vendorBookmarksStore)
