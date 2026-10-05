'use client'

import { useSyncExternalStore } from 'react'

/**
 * Shared ticking clock. Returns null during SSR/hydration so server and client
 * markup always match, then the current epoch ms, updated every `intervalMs`.
 * Development override: append ?now=2027-04-02T11:00:00-07:00 to preview "during the show" states.
 */
type Clock = { subscribe: (listener: () => void) => () => void; getSnapshot: () => number }

function overrideOffset(): number {
	if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') return 0
	const param = new URLSearchParams(window.location.search).get('now')
	const target = param ? Date.parse(param) : NaN
	return Number.isNaN(target) ? 0 : target - Date.now()
}

const offset = overrideOffset()
const current = () => Date.now() + offset
const clocks = new Map<number, Clock>()

function createClock(intervalMs: number): Clock {
	const listeners = new Set<() => void>()
	let now = current()
	let timer: ReturnType<typeof setInterval> | undefined
	return {
		subscribe(listener) {
			listeners.add(listener)
			if (!timer) {
				now = current()
				timer = setInterval(() => {
					now = current()
					listeners.forEach(l => l())
				}, intervalMs)
			}
			return () => {
				listeners.delete(listener)
				if (listeners.size === 0 && timer) {
					clearInterval(timer)
					timer = undefined
				}
			}
		},
		getSnapshot: () => now,
	}
}

function getClock(intervalMs: number): Clock {
	let clock = clocks.get(intervalMs)
	if (!clock) {
		clock = createClock(intervalMs)
		clocks.set(intervalMs, clock)
	}
	return clock
}

const getServerSnapshot = () => null

export function useNow(intervalMs = 30_000): number | null {
	const { subscribe, getSnapshot } = getClock(intervalMs)
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
