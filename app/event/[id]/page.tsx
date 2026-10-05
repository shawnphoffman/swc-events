import { Suspense } from 'react'
import { CalendarPlusIcon, ChevronLeftIcon, ClockIcon, ExternalLinkIcon, MapPinIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ConflictNotice } from '@/components/schedule/conflict-notice'
import { EventRow } from '@/components/schedule/event-row'
import { FavoriteButton } from '@/components/schedule/favorite-button'
import { ShareButton } from '@/components/share-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { celebration } from '@/lib/celebration'
import { getSchedule } from '@/lib/schedule/source'
import { toSummary, venueColor } from '@/lib/schedule/summary'
import { formatDayLong, formatDuration, formatTimeRange, overlaps, showZoneLabel } from '@/lib/time'

export async function generateMetadata({ params }: PageProps<'/event/[id]'>): Promise<Metadata> {
	const { id } = await params
	const { events } = await getSchedule()
	const event = events.find(e => e.id === id)
	if (!event) return { title: 'Event not found' }
	const when = `${formatDayLong(event.day)}, ${formatTimeRange(event.start, event.end)} · ${event.venue}`
	return {
		title: event.title,
		description: `${when}. ${event.description.slice(0, 200)}`,
		openGraph: { title: event.title, description: when, url: `/event/${event.id}` },
	}
}

export default function EventPage({ params }: PageProps<'/event/[id]'>) {
	return (
		<Suspense fallback={<EventSkeleton />}>
			<EventDetail params={params} />
		</Suspense>
	)
}

async function EventDetail({ params }: { params: PageProps<'/event/[id]'>['params'] }) {
	const { id } = await params
	const schedule = await getSchedule()
	const event = schedule.events.find(e => e.id === id)
	if (!event) notFound()

	const colorIndex = schedule.venues.find(v => v.slug === event.venueSlug)?.colorIndex ?? 0
	const colors = new Map(schedule.venues.map(v => [v.slug, v.colorIndex]))
	const summary = (e: (typeof schedule.events)[number]) => toSummary(e, colors.get(e.venueSlug) ?? 0)

	const overlapping = schedule.events.filter(e => e.id !== event.id && overlaps(e, event)).map(summary)
	const laterHere = schedule.events
		.filter(e => e.venueSlug === event.venueSlug && e.day === event.day && Date.parse(e.start) >= Date.parse(event.end) && e.id !== event.id)
		.slice(0, 4)
		.map(summary)
	const duration = formatDuration(event.start, event.end)

	return (
		<article className="flex flex-col gap-6">
			<div>
				<Button asChild variant="ghost" size="sm" className="-ml-2">
					<Link href={`/schedule?day=${event.day}`}>
						<ChevronLeftIcon data-icon="inline-start" />
						{formatDayLong(event.day)}
					</Link>
				</Button>
			</div>

			<header className="flex flex-col gap-4">
				<h1 className="text-3xl font-black tracking-tight text-balance sm:text-4xl">{event.title}</h1>
				<dl className="flex flex-col gap-2 text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6">
					<div className="flex items-center gap-2">
						<dt className="sr-only">When</dt>
						<ClockIcon className="size-4 text-primary" aria-hidden />
						<dd className="tabular-nums">
							{formatDayLong(event.day)}, {formatTimeRange(event.start, event.end)} {showZoneLabel()}
							{duration && <span className="text-muted-foreground/70"> ({duration})</span>}
						</dd>
					</div>
					<div className="flex items-center gap-2">
						<dt className="sr-only">Where</dt>
						<MapPinIcon className="size-4" style={{ color: venueColor(colorIndex) }} aria-hidden />
						<dd>
							<Link href={`/schedule?day=${event.day}&stages=${event.venueSlug}`} className="underline-offset-2 hover:underline">
								{event.venue}
							</Link>
						</dd>
					</div>
				</dl>
				<div className="flex flex-wrap gap-2">
					<FavoriteButton id={event.id} title={event.title} showLabel />
					<Button asChild variant="outline">
						{/* Plain anchor: the browser (and iOS Calendar) should handle the .ics response, not the client router. */}
						<a href={`/event/${event.id}/calendar.ics`}>
							<CalendarPlusIcon data-icon="inline-start" />
							Add to calendar
						</a>
					</Button>
					<ShareButton title={event.title} text={`${event.title} at ${celebration.shortName}`} path={`/event/${event.id}`} />
					{event.url && (
						<Button asChild variant="link">
							<a href={event.url} target="_blank" rel="noreferrer">
								Official listing
								<ExternalLinkIcon data-icon="inline-end" />
							</a>
						</Button>
					)}
				</div>
			</header>

			<ConflictNotice eventId={event.id} overlapping={overlapping} />

			{event.description ? (
				<div className="max-w-prose text-lg leading-relaxed whitespace-pre-line text-pretty">{event.description}</div>
			) : (
				<p className="text-muted-foreground">No description yet.</p>
			)}

			{(laterHere.length > 0 || overlapping.length > 0) && <Separator />}

			<div className="grid gap-6 lg:grid-cols-2">
				{laterHere.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Next on {event.venue}</CardTitle>
							<CardDescription>Stay in your seat for these.</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="flex flex-col gap-2">
								{laterHere.map(e => (
									<EventRow key={e.id} event={e} />
								))}
							</ul>
						</CardContent>
					</Card>
				)}
				{overlapping.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>At the same time</CardTitle>
							<CardDescription>{overlapping.length} other events overlap this one.</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="flex flex-col gap-2">
								{overlapping.slice(0, 8).map(e => (
									<EventRow key={e.id} event={e} />
								))}
							</ul>
						</CardContent>
					</Card>
				)}
			</div>
		</article>
	)
}

function EventSkeleton() {
	return (
		<div className="flex flex-col gap-4" aria-busy="true">
			<Skeleton className="h-7 w-40" />
			<Skeleton className="h-10 w-3/4" />
			<Skeleton className="h-5 w-1/2" />
			<div className="flex gap-2">
				<Skeleton className="h-8 w-40" />
				<Skeleton className="h-8 w-36" />
			</div>
			<Skeleton className="h-32 w-full max-w-prose" />
		</div>
	)
}
