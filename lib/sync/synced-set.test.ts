// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type Remote, SyncedSet } from './synced-set'

/** In-memory stand-in for the favorites table, keyed by user. */
function fakeServer() {
	const rows = new Map<string, string[]>()
	let failNext = false
	const get = (u: string) => rows.get(u) ?? []
	const remote: Remote = {
		fetch: vi.fn(async (u: string) => {
			if (failNext) {
				failNext = false
				throw new Error('network')
			}
			return [...get(u)]
		}),
		add: vi.fn(async (u: string, ids: string[]) => {
			rows.set(u, [...new Set([...get(u), ...ids])])
		}),
		remove: vi.fn(async (u: string, ids: string[]) => {
			rows.set(
				u,
				get(u).filter(id => !ids.includes(id))
			)
		}),
	}
	return { remote, rows, failOnce: () => (failNext = true) }
}

beforeEach(() => {
	localStorage.clear()
	vi.useRealTimers()
})

describe('SyncedSet', () => {
	it('works with no account and persists across reloads', () => {
		const { remote } = fakeServer()
		const a = new SyncedSet('t.favs', remote)
		a.toggle('1')
		a.toggle('2')
		a.toggle('1')
		expect(a.getIds()).toEqual(['2'])
		expect(new SyncedSet('t.favs', remote).getIds()).toEqual(['2'])
		expect(remote.add).not.toHaveBeenCalled()
	})

	it('keeps everything saved on the device when signing in for the first time', async () => {
		const server = fakeServer()
		server.rows.set('u1', ['10', '11'])
		const phone = new SyncedSet('phone.favs', server.remote)
		phone.toggle('20')
		phone.toggle('10')

		phone.attach('u1')
		await phone.sync()

		expect(new Set(phone.getIds())).toEqual(new Set(['10', '11', '20']))
		expect(new Set(server.rows.get('u1'))).toEqual(new Set(['10', '11', '20']))
		expect(phone.getStatus()).toBe('synced')
	})

	it('carries a plan made on one device to another', async () => {
		const server = fakeServer()
		const laptop = new SyncedSet('laptop.favs', server.remote)
		laptop.attach('u1')
		await laptop.sync()
		laptop.addMany(['1', '2', '3'])
		await laptop.sync()

		const phone = new SyncedSet('phone.favs', server.remote)
		phone.attach('u1')
		await phone.sync()
		expect(phone.getIds()).toEqual(['1', '2', '3'])
	})

	it('propagates removals instead of resurrecting them on the next sync', async () => {
		const server = fakeServer()
		const laptop = new SyncedSet('laptop.favs', server.remote)
		const phone = new SyncedSet('phone.favs', server.remote)
		laptop.attach('u1')
		laptop.addMany(['1', '2'])
		await laptop.sync()
		phone.attach('u1')
		await phone.sync()

		laptop.toggle('1')
		await laptop.sync()
		await phone.sync()

		expect(phone.getIds()).toEqual(['2'])
		expect(server.rows.get('u1')).toEqual(['2'])
	})

	it('holds changes made while offline and pushes them later', async () => {
		const server = fakeServer()
		const phone = new SyncedSet('phone.favs', server.remote)
		phone.attach('u1')
		await phone.sync()

		const online = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
		phone.toggle('42')
		await phone.sync()
		expect(phone.getStatus()).toBe('offline')
		expect(server.rows.get('u1') ?? []).toEqual([])
		expect(phone.getIds()).toEqual(['42'])

		online.mockReturnValue(true)
		await phone.sync()
		expect(server.rows.get('u1')).toEqual(['42'])
		expect(phone.getStatus()).toBe('synced')
	})

	it('keeps pending changes and the local copy when a sync fails', async () => {
		vi.useFakeTimers()
		const server = fakeServer()
		const phone = new SyncedSet('phone.favs', server.remote)
		phone.toggle('7')
		server.failOnce()
		phone.attach('u1') // starts the first (failing) sync
		await vi.advanceTimersByTimeAsync(0)

		expect(phone.getStatus()).toBe('error')
		expect(phone.getIds()).toEqual(['7'])
		await vi.advanceTimersByTimeAsync(15_000)
		expect(phone.getStatus()).toBe('synced')
		expect(server.rows.get('u1')).toEqual(['7'])
	})

	it('does not re-merge a device into an account it already synced with', async () => {
		const server = fakeServer()
		const phone = new SyncedSet('phone.favs', server.remote)
		phone.attach('u1')
		phone.addMany(['1'])
		await phone.sync()

		// Removed elsewhere while this device was signed out (session expired, not an explicit sign-out).
		server.rows.set('u1', [])
		phone.attach(null)
		phone.attach('u1')
		await phone.sync()
		expect(phone.getIds()).toEqual([])
	})

	it('clears the device on explicit sign-out', async () => {
		const server = fakeServer()
		const phone = new SyncedSet('phone.favs', server.remote)
		phone.attach('u1')
		phone.addMany(['1'])
		await phone.sync()
		phone.resetLocal()
		expect(phone.getIds()).toEqual([])
		expect(new SyncedSet('phone.favs', server.remote).getIds()).toEqual([])
		expect(server.rows.get('u1')).toEqual(['1'])
	})
})
