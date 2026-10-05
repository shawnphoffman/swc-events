import { slugify } from './normalize'
import type { ScheduleEvent } from './types'

/**
 * Show-specific events that are not in the official panel feed
 * (exhibit hall hours, community meetups, etc.).
 *
 * Times are wall-clock at the venue with an explicit offset.
 * Left empty until the 2027 hours are announced.
 */
type CustomEventInput = Omit<ScheduleEvent, 'venueSlug' | 'day' | 'source'>

const customEventInputs: CustomEventInput[] = []

export const customEvents: ScheduleEvent[] = customEventInputs.map(e => ({
	...e,
	venueSlug: slugify(e.venue),
	day: e.start.slice(0, 10),
	source: 'custom',
}))
