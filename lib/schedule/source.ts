import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'

import { customEvents } from './custom-events'
import { buildSchedule, buildVendors, rawScheduleSchema, rawVendorsSchema } from './normalize'
import { sampleScheduleItems, sampleVendors } from './sample'
import type { Schedule, ScheduleEvent, VendorList } from './types'

/**
 * Data source selection:
 *   SCHEDULE_SOURCE=sample  always use bundled sample data
 *   SCHEDULE_SOURCE=live    never fall back to sample data (even in dev)
 *   (unset)                 live feed; dev falls back to sample when the feed is empty or missing
 *
 * Endpoints are server-only. The legacy NEXT_PUBLIC_SCHEDULE_ENDPOINT is still
 * read as a fallback: schedule rows carry dates, so anything outside the show year
 * is filtered out. Vendors have no dates, and the legacy vendor URL still serves the
 * 2023 London list, so vendors only load from an explicitly set VENDOR_ENDPOINT.
 */
const scheduleEndpoint = () => process.env.SCHEDULE_ENDPOINT || process.env.NEXT_PUBLIC_SCHEDULE_ENDPOINT
const vendorEndpoint = () => process.env.VENDOR_ENDPOINT

const forceSample = () => process.env.SCHEDULE_SOURCE === 'sample'
const allowSampleFallback = () => process.env.SCHEDULE_SOURCE !== 'live' && process.env.NODE_ENV === 'development'

async function fetchJson(url: string): Promise<unknown> {
	const res = await fetch(url, { signal: AbortSignal.timeout(15_000), headers: { accept: 'application/json' } })
	if (!res.ok) throw new Error(`Upstream responded ${res.status}`)
	return res.json()
}

export async function getSchedule(): Promise<Schedule> {
	'use cache'
	cacheTag('schedule')
	cacheLife({ stale: 60, revalidate: 300, expire: 3600 })

	const sample = () => buildSchedule(sampleScheduleItems(), 'sample', { customEvents })
	if (forceSample()) return sample()

	const url = scheduleEndpoint()
	if (!url) return allowSampleFallback() ? sample() : buildSchedule([], 'unpublished', { customEvents })

	try {
		const json = rawScheduleSchema.parse(await fetchJson(url))
		let invalid = 0
		const schedule = buildSchedule(json.schedules, 'live', { customEvents, onInvalid: () => invalid++ })
		if (invalid) console.warn(`[schedule] skipped ${invalid} malformed rows`)
		if (schedule.events.length === 0) {
			return allowSampleFallback() ? sample() : { ...schedule, status: 'unpublished' }
		}
		return schedule
	} catch (error) {
		console.error('[schedule] fetch failed', error)
		// Keep a failed fetch from pinning an empty schedule in the cache.
		cacheLife('seconds')
		return allowSampleFallback() ? sample() : buildSchedule([], 'error', { customEvents })
	}
}

export async function getEvent(id: string): Promise<ScheduleEvent | undefined> {
	const { events } = await getSchedule()
	return events.find(e => e.id === id)
}

export async function getVendors(): Promise<VendorList> {
	'use cache'
	cacheTag('vendors')
	cacheLife({ stale: 300, revalidate: 900, expire: 86400 })

	const sample = (): VendorList => ({ vendors: buildVendors(sampleVendors()), status: 'sample', fetchedAt: new Date().toISOString() })
	if (forceSample()) return sample()

	const url = vendorEndpoint()
	if (!url) return allowSampleFallback() ? sample() : { vendors: [], status: 'unpublished', fetchedAt: new Date().toISOString() }

	try {
		const json = rawVendorsSchema.parse(await fetchJson(url))
		const vendors = buildVendors(json.space_orders)
		if (vendors.length === 0 && allowSampleFallback()) return sample()
		return { vendors, status: vendors.length ? 'live' : 'unpublished', fetchedAt: new Date().toISOString() }
	} catch (error) {
		console.error('[vendors] fetch failed', error)
		cacheLife('seconds')
		return allowSampleFallback() ? sample() : { vendors: [], status: 'error', fetchedAt: new Date().toISOString() }
	}
}
