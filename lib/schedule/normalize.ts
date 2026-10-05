import { TZDate } from '@date-fns/tz'
import { z } from 'zod'

import { celebration } from '@/lib/celebration'

import type { Schedule, ScheduleEvent, ShowDay, Vendor, Venue } from './types'

// ---------------------------------------------------------------------------
// Upstream shapes. Lenient on purpose: the official feeds change between shows,
// and one malformed row should never take the whole schedule down.
// ---------------------------------------------------------------------------

const idSchema = z.union([z.string(), z.number()]).transform(String)
const text = z
	.string()
	.nullish()
	.transform(v => v ?? '')

export const rawScheduleItemSchema = z.looseObject({
	id: idSchema,
	title: text,
	description: text,
	location: text,
	start_time: z.string(),
	end_time: z.string().nullish(),
})

export const rawScheduleSchema = z.looseObject({
	schedules: z.array(z.unknown()),
})

export type RawScheduleItem = z.input<typeof rawScheduleItemSchema>

export const rawVendorSchema = z.looseObject({
	id: idSchema,
	company: text,
	description: text,
	booth: text,
	store_url: z.string().nullish(),
	featured: z.coerce.boolean().nullish(),
	image: z.looseObject({ small: z.string().nullish() }).nullish(),
	specials: z
		.array(
			z.looseObject({
				id: idSchema.optional(),
				title: text,
				price: z.union([z.string(), z.number()]).nullish(),
				link: z.string().nullish(),
			})
		)
		.nullish(),
})

export const rawVendorsSchema = z.looseObject({
	space_orders: z.array(z.unknown()),
})

export type RawVendor = z.input<typeof rawVendorSchema>

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

const namedEntities: Record<string, string> = {
	nbsp: ' ',
	amp: '&',
	quot: '"',
	apos: "'",
	lt: '<',
	gt: '>',
	ndash: '\u2013',
	mdash: '\u2014',
	hellip: '\u2026',
	rsquo: '\u2019',
	lsquo: '\u2018',
	rdquo: '\u201d',
	ldquo: '\u201c',
	trade: '\u2122',
	reg: '\u00ae',
	copy: '\u00a9',
}

export function decodeEntities(input: string): string {
	return input
		.replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
		.replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
		.replace(/&([a-z]+);/gi, (match, name: string) => namedEntities[name.toLowerCase()] ?? match)
}

/** Decode entities and flatten the light HTML the feeds sometimes include. */
export function cleanText(input: string): string {
	return decodeEntities(
		input
			.replace(/<br\s*\/?>/gi, '\n')
			.replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
			.replace(/<[^>]+>/g, '')
	)
		.replace(/\r\n?/g, '\n')
		.replace(/[ \t]+\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim()
}

export function slugify(input: string): string {
	return input
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/&/g, ' and ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

/** Strip filler words so venues sort and display sensibly ("The Star Wars Galaxy Stage" -> "Galaxy Stage"). */
export function cleanVenueName(venue: string): string {
	return venue
		.trim()
		.replace(/^The\s+/i, '')
		.replace(/^Star Wars\s+/i, '')
		.replace(/\s*\(Room\s+([^)]+)\)/i, ' $1')
		.replace(/\s+/g, ' ')
		.trim()
}

// ---------------------------------------------------------------------------
// Time helpers
// ---------------------------------------------------------------------------

const wallTimePattern = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/

/**
 * Parse a feed timestamp into an ISO string with the show's offset.
 * Feeds publish wall-clock time at the venue ("2027-04-01 10:00:00"); timestamps
 * that already carry an offset or Z are respected as-is.
 */
export function parseShowTime(raw: string, timeZone: string = celebration.timeZone): string | null {
	const value = raw.trim()
	if (/(Z|[+-]\d{2}:?\d{2})$/.test(value)) {
		const date = new Date(value.replace(' ', 'T'))
		if (Number.isNaN(date.getTime())) return null
		return new TZDate(date.getTime(), timeZone).toISOString()
	}
	const match = wallTimePattern.exec(value)
	if (!match) return null
	const [, y, mo, d, h, mi, s] = match
	const date = new TZDate(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s ?? 0), timeZone)
	return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

/** YYYY-MM-DD of an ISO timestamp in the show's time zone. */
export function showDate(iso: string, timeZone: string = celebration.timeZone): string {
	const d = new TZDate(new Date(iso).getTime(), timeZone)
	const pad = (n: number) => String(n).padStart(2, '0')
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function compareEvents(a: ScheduleEvent, b: ScheduleEvent): number {
	return (
		Date.parse(a.start) - Date.parse(b.start) ||
		Date.parse(a.end) - Date.parse(b.end) ||
		a.title.localeCompare(b.title) ||
		a.id.localeCompare(b.id)
	)
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

export type NormalizeOptions = {
	year?: number
	timeZone?: string
	customEvents?: ScheduleEvent[]
	onInvalid?: (reason: string, item: unknown) => void
}

export function normalizeScheduleItem(item: unknown, options: NormalizeOptions = {}): ScheduleEvent | null {
	const { timeZone = celebration.timeZone, onInvalid } = options
	const parsed = rawScheduleItemSchema.safeParse(item)
	if (!parsed.success) {
		onInvalid?.('schema', item)
		return null
	}
	const raw = parsed.data
	const start = parseShowTime(raw.start_time, timeZone)
	if (!start) {
		onInvalid?.('start_time', item)
		return null
	}
	let end = raw.end_time ? parseShowTime(raw.end_time, timeZone) : null
	// Feeds occasionally ship end < start or no end at all; treat those as point-in-time events.
	if (!end || Date.parse(end) < Date.parse(start)) end = start

	const venue = cleanVenueName(cleanText(raw.location)) || 'TBA'
	return {
		id: raw.id,
		title: cleanText(raw.title) || 'Untitled event',
		description: cleanText(raw.description),
		venue,
		venueSlug: slugify(venue),
		start,
		end,
		day: showDate(start, timeZone),
		url: celebration.panelUrl(raw.id),
		source: 'official',
	}
}

export function buildSchedule(
	rawItems: unknown[],
	status: Schedule['status'],
	options: NormalizeOptions = {}
): Schedule {
	const { year = celebration.year, customEvents = [] } = options

	const byId = new Map<string, ScheduleEvent>()
	for (const item of rawItems) {
		const event = normalizeScheduleItem(item, options)
		if (!event) continue
		// Feeds have historically included prior-year rows; keep only this show.
		if (!event.day.startsWith(`${year}-`)) continue
		byId.set(event.id, event)
	}
	for (const event of customEvents) byId.set(event.id, event)

	const events = [...byId.values()].sort(compareEvents)
	return { events, venues: deriveVenues(events), days: deriveDays(events), status, fetchedAt: new Date().toISOString() }
}

export function deriveVenues(events: ScheduleEvent[]): Venue[] {
	const counts = new Map<string, { name: string; count: number }>()
	for (const e of events) {
		const entry = counts.get(e.venueSlug) ?? { name: e.venue, count: 0 }
		entry.count++
		counts.set(e.venueSlug, entry)
	}
	return [...counts.entries()]
		.sort(([, a], [, b]) => a.name.localeCompare(b.name))
		.map(([slug, { name, count }], i) => ({ name, slug, colorIndex: i, eventCount: count }))
}

export function deriveDays(events: ScheduleEvent[]): ShowDay[] {
	const counts = new Map<string, number>()
	for (const e of events) counts.set(e.day, (counts.get(e.day) ?? 0) + 1)
	return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, eventCount]) => ({ date, eventCount }))
}

// ---------------------------------------------------------------------------
// Vendors
// ---------------------------------------------------------------------------

function normalizeUrl(url: string | null | undefined): string | undefined {
	const value = url?.trim()
	if (!value) return undefined
	const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`
	try {
		const parsed = new URL(withProtocol)
		return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : undefined
	} catch {
		return undefined
	}
}

export function normalizeVendor(item: unknown): Vendor | null {
	const parsed = rawVendorSchema.safeParse(item)
	if (!parsed.success) return null
	const raw = parsed.data
	const company = cleanText(raw.company)
	if (!company || /testington/i.test(company)) return null

	const booth = raw.booth.trim()
	const isTattoo = /^tattoo pavilion$/i.test(booth) || /^TAT/i.test(booth)
	const booths = booth
		? booth
				.split(/\s*,\s*/)
				.map(b => b.trim())
				.filter(Boolean)
		: []

	return {
		id: raw.id,
		company,
		description: cleanText(raw.description),
		booths,
		specials: (raw.specials ?? [])
			.map((s, i) => ({
				id: s.id ?? `${raw.id}-${i}`,
				title: cleanText(s.title),
				price: s.price != null && String(s.price).trim() ? String(s.price).trim() : undefined,
				link: normalizeUrl(s.link),
			}))
			.filter(s => s.title),
		imageUrl: normalizeUrl(raw.image?.small),
		url: normalizeUrl(raw.store_url),
		featured: Boolean(raw.featured),
		isTattoo,
	}
}

export function buildVendors(rawItems: unknown[]): Vendor[] {
	const byId = new Map<string, Vendor>()
	for (const item of rawItems) {
		const vendor = normalizeVendor(item)
		if (vendor) byId.set(vendor.id, vendor)
	}
	return [...byId.values()].sort((a, b) => Number(b.featured) - Number(a.featured) || a.company.localeCompare(b.company))
}
