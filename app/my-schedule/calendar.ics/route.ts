import type { NextRequest } from 'next/server'

import { celebration } from '@/lib/celebration'
import { buildCalendar, calendarResponse } from '@/lib/ics'
import { getSchedule } from '@/lib/schedule/source'

/**
 * Calendar for a set of event ids. Works as a one-off download or as a
 * webcal:// subscription: ids are fixed in the URL, but times/rooms track the
 * live schedule, so subscribers pick up reschedules automatically.
 */
export async function GET(request: NextRequest) {
	const ids = new Set(
		(request.nextUrl.searchParams.get('ids') ?? '')
			.split(',')
			.map(s => s.trim())
			.filter(Boolean)
			.slice(0, 500)
	)
	const { events } = await getSchedule()
	const selected = events.filter(e => ids.has(e.id))
	return calendarResponse(buildCalendar(selected, `My ${celebration.shortName}`), 'my-celebration.ics')
}
