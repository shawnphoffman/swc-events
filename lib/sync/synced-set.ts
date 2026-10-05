'use client'

/**
 * A set of ids (saved events, vendor bookmarks) that is local-first and,
 * when signed in, synced to the user's account.
 *
 * - Every change applies to localStorage immediately, so the app works offline
 *   on show-floor wifi, and is recorded as a pending op.
 * - When signed in, pending ops are pushed (idempotently) and the server copy is
 *   pulled back: server set, minus pending removes, plus pending adds.
 * - The first time a device syncs to an account, everything already saved on the
 *   device is pushed as adds, so signing in never loses anything.
 */

export type SyncStatus = 'local' | 'syncing' | 'synced' | 'offline' | 'error'

export type Remote = {
	fetch: (userId: string) => Promise<string[]>
	add: (userId: string, ids: string[]) => Promise<void>
	remove: (userId: string, ids: string[]) => Promise<void>
}

type Op = 'add' | 'remove'
type Pending = Record<string, Op>

const EMPTY: readonly string[] = Object.freeze([])

function readJson<T>(key: string, fallback: T, valid: (v: unknown) => boolean): T {
	try {
		const raw = window.localStorage.getItem(key)
		if (!raw) return fallback
		const parsed: unknown = JSON.parse(raw)
		return valid(parsed) ? (parsed as T) : fallback
	} catch {
		return fallback
	}
}

function writeJson(key: string, value: unknown) {
	try {
		if (value === null) window.localStorage.removeItem(key)
		else window.localStorage.setItem(key, JSON.stringify(value))
	} catch {
		// Private mode / quota: the in-memory copy still works for this session.
	}
}

const isStringArray = (v: unknown) => Array.isArray(v) && v.every(x => typeof x === 'string')
const isPending = (v: unknown) => typeof v === 'object' && v !== null && Object.values(v).every(x => x === 'add' || x === 'remove')

export class SyncedSet {
	private ids: readonly string[] | null = null
	private pending: Pending | null = null
	private status: SyncStatus = 'local'
	private userId: string | null = null
	private running: Promise<void> | null = null
	private rerun = false
	private flushTimer: ReturnType<typeof setTimeout> | undefined
	private retryTimer: ReturnType<typeof setTimeout> | undefined
	private listeners = new Set<() => void>()

	constructor(
		private readonly key: string,
		private readonly remote: Remote
	) {}

	// -- storage -------------------------------------------------------------

	private get pendingKey() {
		return `${this.key}.pending`
	}
	private get ownerKey() {
		return `${this.key}.owner`
	}

	private loadIds(): readonly string[] {
		this.ids ??= Object.freeze(readJson<string[]>(this.key, [], isStringArray))
		return this.ids
	}

	private loadPending(): Pending {
		this.pending ??= readJson<Pending>(this.pendingKey, {}, isPending)
		return this.pending
	}

	private saveIds(next: readonly string[]) {
		this.ids = Object.freeze([...new Set(next)])
		writeJson(this.key, this.ids)
	}

	private savePending(next: Pending) {
		this.pending = next
		writeJson(this.pendingKey, Object.keys(next).length ? next : null)
	}

	private setStatus(status: SyncStatus) {
		if (this.status === status) return
		this.status = status
		this.emit()
	}

	private emit() {
		this.listeners.forEach(l => l())
	}

	// -- React store API -----------------------------------------------------

	subscribe = (listener: () => void) => {
		this.listeners.add(listener)
		return () => this.listeners.delete(listener)
	}

	getIds = (): readonly string[] => (typeof window === 'undefined' ? EMPTY : this.loadIds())
	getStatus = (): SyncStatus => this.status

	/** Another tab changed storage; drop caches and re-read. */
	reloadFromStorage() {
		this.ids = null
		this.pending = null
		this.emit()
	}

	// -- mutations -----------------------------------------------------------

	private apply(changes: [string, Op][]) {
		const ids = new Set(this.loadIds())
		const pending = { ...this.loadPending() }
		for (const [id, op] of changes) {
			if (op === 'add') ids.add(id)
			else ids.delete(id)
			pending[id] = op
		}
		this.saveIds([...ids])
		this.savePending(pending)
		this.emit()
		this.scheduleFlush()
	}

	toggle(id: string) {
		this.apply([[id, this.loadIds().includes(id) ? 'remove' : 'add']])
	}

	addMany(ids: string[]) {
		this.apply(ids.map(id => [id, 'add']))
	}

	removeMany(ids: string[]) {
		this.apply(ids.map(id => [id, 'remove']))
	}

	/** Explicit sign-out: the data is safe in the account, so leave nothing behind on this device. */
	resetLocal() {
		this.userId = null
		this.saveIds([])
		this.savePending({})
		writeJson(this.ownerKey, null)
		this.status = 'local'
		this.emit()
	}

	// -- sync ----------------------------------------------------------------

	/** Point the set at a signed-in user (or null when signed out) and sync. */
	attach(userId: string | null) {
		if (userId === this.userId) return
		this.userId = userId
		if (!userId) {
			this.setStatus('local')
			return
		}
		const owner = readJson<string | null>(this.ownerKey, null, v => typeof v === 'string')
		if (owner !== userId) {
			// First sync of this device to this account: keep everything saved here.
			const pending = { ...this.loadPending() }
			for (const id of this.loadIds()) pending[id] ??= 'add'
			this.savePending(pending)
			writeJson(this.ownerKey, userId)
		}
		void this.sync()
	}

	private scheduleFlush() {
		if (!this.userId) return
		clearTimeout(this.flushTimer)
		this.flushTimer = setTimeout(() => void this.sync(), 400)
	}

	/** Push pending ops, then pull. Concurrent calls coalesce into one follow-up run. */
	sync(): Promise<void> {
		if (!this.userId) return Promise.resolve()
		if (this.running) {
			this.rerun = true
			return this.running
		}
		this.running = this.run().finally(() => {
			this.running = null
			if (this.rerun) {
				this.rerun = false
				void this.sync()
			}
		})
		return this.running
	}

	private async run() {
		const userId = this.userId
		if (!userId) return
		if (typeof navigator !== 'undefined' && !navigator.onLine) {
			this.setStatus('offline')
			return
		}
		clearTimeout(this.retryTimer)
		this.setStatus('syncing')
		try {
			const snapshot = { ...this.loadPending() }
			const adds = Object.keys(snapshot).filter(id => snapshot[id] === 'add')
			const removes = Object.keys(snapshot).filter(id => snapshot[id] === 'remove')
			if (adds.length) await this.remote.add(userId, adds)
			if (removes.length) await this.remote.remove(userId, removes)

			// Clear only ops that didn't change while the request was in flight.
			const pending = { ...this.loadPending() }
			for (const [id, op] of Object.entries(snapshot)) if (pending[id] === op) delete pending[id]
			this.savePending(pending)

			const server = await this.remote.fetch(userId)
			if (this.userId !== userId) return // signed out or switched mid-flight
			const latest = this.loadPending()
			const merged = server.filter(id => latest[id] !== 'remove')
			for (const [id, op] of Object.entries(latest)) if (op === 'add' && !merged.includes(id)) merged.push(id)
			this.saveIds(merged)
			this.setStatus(Object.keys(latest).length ? 'syncing' : 'synced')
			this.emit()
		} catch (error) {
			console.warn(`[sync] ${this.key} failed`, error)
			this.setStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'error')
			this.retryTimer = setTimeout(() => void this.sync(), 15_000)
		}
	}
}
