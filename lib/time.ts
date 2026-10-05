import { celebration } from '@/lib/celebration'

/**
 * All schedule times render in the show's time zone. Attendees are physically
 * in Los Angeles; showing a remote viewer's local time would make the agenda
 * disagree with every sign in the building.
 */
const timeZone = celebration.timeZone

const timeFormat = new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit' })
const dayLongFormat = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' })
const dayShortFormat = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short' })
const dayNumberFormat = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' })
const zoneNameFormat = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' })

export function formatTime(iso: string): string {
	return timeFormat.format(new Date(iso)).replace(':00', '').replace(' ', ' ')
}

export function formatTimeRange(start: string, end: string): string {
	if (start === end) return formatTime(start)
	return `${formatTime(start)} – ${formatTime(end)}`
}

/** Calendar dates are YYYY-MM-DD; anchor at UTC noon so formatting never slips a day. */
const anchor = (date: string) => new Date(`${date}T12:00:00Z`)

export const formatDayLong = (date: string) => dayLongFormat.format(anchor(date))
export const formatDayShort = (date: string) => dayShortFormat.format(anchor(date))
export const formatDayNumber = (date: string) => dayNumberFormat.format(anchor(date))

export function durationMinutes(start: string, end: string): number {
	return Math.round((Date.parse(end) - Date.parse(start)) / 60000)
}

export function formatDuration(start: string, end: string): string | null {
	const minutes = durationMinutes(start, end)
	if (minutes <= 0) return null
	const h = Math.floor(minutes / 60)
	const m = minutes % 60
	return [h ? `${h}h` : '', m ? `${m}m` : ''].filter(Boolean).join(' ')
}

/** Short zone label for the show, e.g. "PDT". */
export function showZoneLabel(at: Date = new Date(celebration.startsAt)): string {
	return zoneNameFormat.formatToParts(at).find(p => p.type === 'timeZoneName')?.value ?? ''
}

const showDateFormat = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })

/** YYYY-MM-DD at the venue for an epoch ms (en-CA formats as ISO date). */
export function showDateOf(epochMs: number): string {
	return showDateFormat.format(new Date(epochMs))
}

/** Minutes since local midnight at the venue for an ISO timestamp. */
const clockFormat = new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })

export function minutesIntoShowDay(iso: string): number {
	const parts = clockFormat.formatToParts(new Date(iso))
	const get = (type: string) => Number(parts.find(p => p.type === type)?.value ?? 0)
	return get('hour') * 60 + get('minute')
}

export function overlaps(a: { start: string; end: string }, b: { start: string; end: string }): boolean {
	return Date.parse(a.start) < Date.parse(b.end) && Date.parse(b.start) < Date.parse(a.end)
}
