import { buildCalendar, calendarResponse } from '@/lib/ics'
import { getEvent } from '@/lib/schedule/source'

export async function GET(_request: Request, ctx: RouteContext<'/event/[id]/calendar.ics'>) {
	const { id } = await ctx.params
	const event = await getEvent(id)
	if (!event) return new Response('Event not found', { status: 404 })
	return calendarResponse(buildCalendar([event], event.title), `swc-${event.id}.ics`)
}
