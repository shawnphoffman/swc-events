import type { Schedule, ScheduleEvent } from './types'

/**
 * The slice of an event shipped to client components. Full descriptions stay on
 * the server (event detail page) to keep the RSC payload small on show-floor wifi.
 */
export type EventSummary = {
	id: string
	title: string
	venue: string
	venueSlug: string
	colorIndex: number
	start: string
	end: string
	day: string
	snippet: string
}

const SNIPPET_LENGTH = 180

export function toSummaries(schedule: Schedule): EventSummary[] {
	const colors = new Map(schedule.venues.map(v => [v.slug, v.colorIndex]))
	return schedule.events.map(e => toSummary(e, colors.get(e.venueSlug) ?? 0))
}

export function toSummary(e: ScheduleEvent, colorIndex: number): EventSummary {
	const flat = e.description.replace(/\s+/g, ' ').trim()
	return {
		id: e.id,
		title: e.title,
		venue: e.venue,
		venueSlug: e.venueSlug,
		colorIndex,
		start: e.start,
		end: e.end,
		day: e.day,
		snippet: flat.length > SNIPPET_LENGTH ? `${flat.slice(0, SNIPPET_LENGTH).trimEnd()}…` : flat,
	}
}

/** CSS color for a venue palette slot (12 hues, wraps for larger shows). */
export const venueColor = (colorIndex: number) => `var(--venue-${colorIndex % 12})`
