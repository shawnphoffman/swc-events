import { createEvents, type EventAttributes } from 'ics'

import { celebration } from '@/lib/celebration'
import type { ScheduleEvent } from '@/lib/schedule/types'

function toAttributes(event: ScheduleEvent): EventAttributes {
	const start = Date.parse(event.start)
	// ics rejects zero-length events with an end; give point-in-time events 15 minutes.
	const end = Math.max(Date.parse(event.end), start + 15 * 60 * 1000)
	return {
		uid: `${event.id}@swc.events`,
		start,
		startInputType: 'utc',
		startOutputType: 'utc',
		end,
		endInputType: 'utc',
		endOutputType: 'utc',
		title: event.title,
		description: [event.description, event.url ? `Details: ${event.url}` : ''].filter(Boolean).join('\n\n'),
		location: `${event.venue}, ${celebration.location}`,
		url: event.url,
		categories: [celebration.shortName, event.venue],
		productId: 'swc.events',
	}
}

export function buildCalendar(events: ScheduleEvent[], name: string): string {
	const { error, value } = createEvents(events.map(toAttributes), { calName: name })
	if (error || !value) throw error ?? new Error('Failed to build calendar')
	return value
}

export function calendarResponse(ics: string, filename: string): Response {
	return new Response(ics, {
		headers: {
			'content-type': 'text/calendar; charset=utf-8',
			'content-disposition': `inline; filename="${filename}"`,
			'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
		},
	})
}
