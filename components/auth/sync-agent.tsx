'use client'

import { useEffect } from 'react'

import { getSessionState, subscribeSession } from '@/hooks/use-session'
import { allStores } from '@/lib/sync/stores'

const REFRESH_MS = 2 * 60_000

/**
 * Keeps saved events in step with the account: attaches stores on sign-in,
 * re-syncs when the tab regains focus or the network returns, refreshes
 * periodically while visible, and mirrors changes from other tabs.
 */
export function SyncAgent() {
	useEffect(() => {
		const attach = () => {
			const session = getSessionState()
			const userId = session.status === 'signed-in' ? session.user.id : null
			if (session.status === 'loading') return
			allStores.forEach(s => s.attach(userId))
		}
		const syncAll = () => {
			if (document.visibilityState === 'visible') allStores.forEach(s => void s.sync())
		}
		const onStorage = (e: StorageEvent) => {
			if (e.key) allStores.forEach(s => s.reloadFromStorage())
		}

		attach()
		const unsubscribe = subscribeSession(attach)
		window.addEventListener('online', syncAll)
		window.addEventListener('storage', onStorage)
		document.addEventListener('visibilitychange', syncAll)
		const interval = setInterval(syncAll, REFRESH_MS)
		return () => {
			unsubscribe()
			window.removeEventListener('online', syncAll)
			window.removeEventListener('storage', onStorage)
			document.removeEventListener('visibilitychange', syncAll)
			clearInterval(interval)
		}
	}, [])

	return null
}
