'use client'

import { ArrowRightIcon, HeartIcon, RadioIcon } from 'lucide-react'
import Link from 'next/link'

import { EventRow } from '@/components/schedule/event-row'
import { eventStatus } from '@/components/schedule/use-schedule-filters'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useFavorites } from '@/hooks/use-favorites'
import { useNow } from '@/hooks/use-now'
import { celebration } from '@/lib/celebration'
import type { EventSummary } from '@/lib/schedule/summary'
import { showDateOf } from '@/lib/time'

const DAY_MS = 86_400_000

/**
 * Before the show: days-to-go. During: what's live and what's next in your schedule.
 * After: a thank-you. Renders a skeleton until the client clock is known, so
 * the prerendered shell never shows a stale state.
 */
export function ShowStatus({ events }: { events: EventSummary[] }) {
	const now = useNow(30_000)
	const favorites = useFavorites()

	if (now === null) return <Skeleton className="h-40 w-full rounded-xl" />

	const start = Date.parse(celebration.startsAt)
	const end = Date.parse(celebration.endsAt)
	const today = showDateOf(now)

	if (now < start) {
		const days = Math.floor((start - now) / DAY_MS)
		return (
			<Card>
				<CardHeader>
					<CardDescription>Doors open in</CardDescription>
					<CardTitle className="text-5xl font-black text-primary tabular-nums">
						{days} {days === 1 ? 'day' : 'days'}
					</CardTitle>
				</CardHeader>
				<CardFooter>
					<Button asChild variant="link" className="px-0">
						<Link href="/countdown">
							Full countdown
							<ArrowRightIcon data-icon="inline-end" />
						</Link>
					</Button>
				</CardFooter>
			</Card>
		)
	}

	if (now > end) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Thanks for an amazing {celebration.shortName}!</CardTitle>
					<CardDescription>See you at the next one. Your saved schedule will stick around on this device.</CardDescription>
				</CardHeader>
			</Card>
		)
	}

	const todays = events.filter(e => e.day === today)
	const live = todays.filter(e => eventStatus(e, now) === 'live')
	const mineNext = todays.filter(e => favorites.has(e.id) && eventStatus(e, now) !== 'past').slice(0, 3)
	const liveMineFirst = [...live].sort((a, b) => Number(favorites.has(b.id)) - Number(favorites.has(a.id))).slice(0, 5)

	return (
		<div className="grid gap-4 lg:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<RadioIcon className="size-5 text-primary" aria-hidden />
						Happening now
					</CardTitle>
					<CardDescription>{live.length ? `${live.length} events live` : 'Nothing on stage right now.'}</CardDescription>
				</CardHeader>
				{liveMineFirst.length > 0 && (
					<CardContent>
						<ul className="flex flex-col gap-2">
							{liveMineFirst.map(e => (
								<EventRow key={e.id} event={e} status="live" />
							))}
						</ul>
					</CardContent>
				)}
				<CardFooter>
					<Button asChild variant="link" className="px-0">
						<Link href={`/schedule?day=${today}`}>
							Today&apos;s schedule
							<ArrowRightIcon data-icon="inline-end" />
						</Link>
					</Button>
				</CardFooter>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<HeartIcon className="size-5 text-favorite" aria-hidden />
						Up next for you
					</CardTitle>
					<CardDescription>{mineNext.length ? 'From your saved events today.' : 'Nothing else saved for today.'}</CardDescription>
				</CardHeader>
				{mineNext.length > 0 && (
					<CardContent>
						<ul className="flex flex-col gap-2">
							{mineNext.map(e => (
								<EventRow key={e.id} event={e} status={eventStatus(e, now)} />
							))}
						</ul>
					</CardContent>
				)}
				<CardFooter>
					<Button asChild variant="link" className="px-0">
						<Link href="/my-schedule">
							My schedule
							<ArrowRightIcon data-icon="inline-end" />
						</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	)
}
