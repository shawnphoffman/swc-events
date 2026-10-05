'use client'

import { useMemo } from 'react'
import { CalendarPlusIcon, CalendarSyncIcon, CloudUploadIcon, HeartIcon, PrinterIcon, Share2Icon, TriangleAlertIcon, UsersIcon } from 'lucide-react'
import Link from 'next/link'
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'
import { toast } from 'sonner'

import { openSignIn } from '@/components/auth/sign-in-dialog'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { useFavorites } from '@/hooks/use-favorites'
import { useNow } from '@/hooks/use-now'
import { useSession } from '@/hooks/use-session'
import type { EventSummary } from '@/lib/schedule/summary'
import { formatDayLong, overlaps } from '@/lib/time'

import { EventRow } from './event-row'
import { eventStatus } from './use-schedule-filters'

function groupByDay(events: EventSummary[]) {
	const map = new Map<string, EventSummary[]>()
	for (const e of events) map.set(e.day, [...(map.get(e.day) ?? []), e])
	return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
}

function conflictIds(events: EventSummary[]): Set<string> {
	const ids = new Set<string>()
	for (let i = 0; i < events.length; i++) {
		for (let j = i + 1; j < events.length; j++) {
			const a = events[i]!
			const b = events[j]!
			if (Date.parse(b.start) >= Date.parse(a.end)) break // sorted by start
			if (overlaps(a, b)) {
				ids.add(a.id)
				ids.add(b.id)
			}
		}
	}
	return ids
}

export function MySchedule({ events }: { events: EventSummary[] }) {
	const favorites = useFavorites()
	const session = useSession()
	const [shared, setShared] = useQueryState('shared', parseAsArrayOf(parseAsString).withDefault([]))
	const now = useNow(30_000)

	const viewingShared = shared.length > 0
	const ids = viewingShared ? shared : favorites.ids
	const byId = useMemo(() => new Map(events.map(e => [e.id, e])), [events])
	const mine = useMemo(() => ids.map(id => byId.get(id)).filter((e): e is EventSummary => !!e).sort((a, b) => Date.parse(a.start) - Date.parse(b.start) || a.title.localeCompare(b.title)), [ids, byId])
	const missing = ids.filter(id => !byId.has(id))
	const conflicts = useMemo(() => conflictIds(mine), [mine])
	const groups = groupByDay(mine)

	const idParam = mine.map(e => e.id).join(',')
	const calendarPath = `/my-schedule/calendar.ics?ids=${idParam}`

	const copy = async (text: string, message: string) => {
		try {
			await navigator.clipboard.writeText(text)
			toast.success(message)
		} catch {
			toast.error('Couldn’t copy', { description: text })
		}
	}

	if (viewingShared) {
		const newCount = shared.filter(id => byId.has(id) && !favorites.has(id)).length
		return (
			<div className="flex flex-col gap-4">
				<Alert>
					<UsersIcon />
					<AlertTitle>Someone shared their schedule with you</AlertTitle>
					<AlertDescription>
						{mine.length} events.{' '}
						{newCount > 0 ? `${newCount} aren’t in your schedule yet.` : 'You already have all of them.'}
					</AlertDescription>
					<AlertAction className="flex gap-2">
						{newCount > 0 && (
							<Button
								size="sm"
								onClick={() => {
									favorites.addMany(shared.filter(id => byId.has(id)))
									toast.success(`Added ${newCount} events to your schedule`)
									setShared(null)
								}}
							>
								Add all
							</Button>
						)}
						<Button size="sm" variant="outline" onClick={() => setShared(null)}>
							View mine
						</Button>
					</AlertAction>
				</Alert>
				<DayList groups={groups} conflicts={conflicts} now={now} />
			</div>
		)
	}

	if (mine.length === 0) {
		return (
			<Empty className="border border-dashed">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<HeartIcon />
					</EmptyMedia>
					<EmptyTitle>Your schedule is empty</EmptyTitle>
					<EmptyDescription>
						Tap the heart on any panel to save it here. Saved events stay on this device; no account needed.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button asChild>
						<Link href="/schedule">Browse the schedule</Link>
					</Button>
				</EmptyContent>
			</Empty>
		)
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center gap-2" data-print="hide">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button>
							<CalendarPlusIcon data-icon="inline-start" />
							Add to calendar
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-72">
						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<a href={calendarPath}>
									<CalendarPlusIcon />
									<span className="flex flex-col">
										<span>Download .ics</span>
										<span className="text-xs text-muted-foreground">One-time import of {mine.length} events</span>
									</span>
								</a>
							</DropdownMenuItem>
							<DropdownMenuItem
								onSelect={() => {
									const url = new URL(calendarPath, window.location.origin)
									window.location.href = `webcal://${url.host}${url.pathname}${url.search}`
								}}
							>
								<CalendarSyncIcon />
								<span className="flex flex-col">
									<span>Subscribe</span>
									<span className="text-xs text-muted-foreground">Times update if panels move</span>
								</span>
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
				<Button variant="outline" onClick={() => copy(new URL(`/my-schedule?shared=${idParam}`, window.location.origin).toString(), 'Share link copied')}>
					<Share2Icon data-icon="inline-start" />
					Share
				</Button>
				<Button variant="outline" onClick={() => window.print()}>
					<PrinterIcon data-icon="inline-start" />
					Print
				</Button>
			</div>

			{session.status === 'signed-out' && (
				<Alert data-print="hide">
					<CloudUploadIcon />
					<AlertTitle>Saved on this device only</AlertTitle>
					<AlertDescription>
						Browsers can clear site data, and it won&apos;t follow you to your phone. Sign in to keep it safe and synced.
					</AlertDescription>
					<AlertAction>
						<Button size="sm" onClick={openSignIn}>
							Sign in
						</Button>
					</AlertAction>
				</Alert>
			)}

			{conflicts.size > 0 && (
				<Alert variant="destructive">
					<TriangleAlertIcon />
					<AlertTitle>{conflicts.size} events overlap</AlertTitle>
					<AlertDescription>They&apos;re marked below. You may need to pick between them.</AlertDescription>
				</Alert>
			)}

			{missing.length > 0 && (
				<Alert>
					<TriangleAlertIcon />
					<AlertTitle>
						{missing.length} saved event{missing.length === 1 ? ' is' : 's are'} no longer on the schedule
					</AlertTitle>
					<AlertDescription>They were likely cancelled or replaced.</AlertDescription>
					<AlertAction>
						<Button
							size="sm"
							variant="outline"
							onClick={() => favorites.removeMany(missing)}
						>
							Remove
						</Button>
					</AlertAction>
				</Alert>
			)}

			<DayList groups={groups} conflicts={conflicts} now={now} />
		</div>
	)
}

function DayList({ groups, conflicts, now }: { groups: [string, EventSummary[]][]; conflicts: Set<string>; now: number | null }) {
	return groups.map(([day, list]) => (
		<section key={day} className="flex flex-col gap-2">
			<h2 className="sticky top-14 z-10 -mx-4 bg-background/80 px-4 py-2 text-lg font-bold backdrop-blur-md">
				{formatDayLong(day)} <span className="text-sm font-normal text-muted-foreground">({list.length})</span>
			</h2>
			<ul className="flex flex-col gap-2">
				{list.map(e => (
					<EventRow key={e.id} event={e} conflict={conflicts.has(e.id)} status={eventStatus(e, now)} />
				))}
			</ul>
		</section>
	))
}
