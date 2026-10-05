'use client'

import { useCallback, useSyncExternalStore } from 'react'

import { celebration } from '@/lib/celebration'

/**
 * Favorites live in localStorage (no account needed) and sync across tabs.
 * One store per key so event favorites and vendor bookmarks stay independent.
 */
type Store = {
	subscribe: (listener: () => void) => () => void
	getSnapshot: () => readonly string[]
	set: (next: readonly string[]) => void
}

const EMPTY: readonly string[] = Object.freeze([])
const stores = new Map<string, Store>()

function read(key: string): readonly string[] {
	try {
		const raw = window.localStorage.getItem(key)
		const parsed: unknown = raw ? JSON.parse(raw) : []
		return Array.isArray(parsed) ? parsed.map(String) : EMPTY
	} catch {
		return EMPTY
	}
}

function getStore(key: string): Store {
	const existing = stores.get(key)
	if (existing) return existing

	const listeners = new Set<() => void>()
	let snapshot: readonly string[] | null = null
	const emit = () => listeners.forEach(l => l())

	const onStorage = (e: StorageEvent) => {
		if (e.key !== key) return
		snapshot = read(key)
		emit()
	}

	const store: Store = {
		subscribe(listener) {
			if (listeners.size === 0) window.addEventListener('storage', onStorage)
			listeners.add(listener)
			return () => {
				listeners.delete(listener)
				if (listeners.size === 0) window.removeEventListener('storage', onStorage)
			}
		},
		getSnapshot() {
			snapshot ??= read(key)
			return snapshot
		},
		set(next) {
			snapshot = Object.freeze([...new Set(next)])
			try {
				window.localStorage.setItem(key, JSON.stringify(snapshot))
			} catch {
				// Private mode / quota: keep the in-memory value for this session.
			}
			emit()
		},
	}
	stores.set(key, store)
	return store
}

const getServerSnapshot = () => EMPTY

function useIdSet(key: string) {
	const store = getStore(key)
	const ids = useSyncExternalStore(store.subscribe, store.getSnapshot, getServerSnapshot)

	const has = useCallback((id: string) => ids.includes(id), [ids])
	const toggle = useCallback(
		(id: string) => {
			const current = store.getSnapshot()
			store.set(current.includes(id) ? current.filter(x => x !== id) : [...current, id])
		},
		[store]
	)
	const addMany = useCallback((add: string[]) => store.set([...store.getSnapshot(), ...add]), [store])
	const clear = useCallback(() => store.set([]), [store])

	return { ids, has, toggle, addMany, clear }
}

export const favoritesKey = `${celebration.storagePrefix}.favorites`
export const vendorBookmarksKey = `${celebration.storagePrefix}.vendorBookmarks`

export const useFavorites = () => useIdSet(favoritesKey)
export const useVendorBookmarks = () => useIdSet(vendorBookmarksKey)
