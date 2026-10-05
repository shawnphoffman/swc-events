'use client'

import { useMemo } from 'react'
import { ArrowDownIcon, SearchXIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import type { EventSummary } from '@/lib/schedule/summary'
import type { ShowDay, Venue } from '@/lib/schedule/types'
import { formatDayLong, formatTime, showZoneLabel } from '@/lib/time'

import { EventRow } from './event-row'
import { DayTabs, MineToggle, SearchBox, StageFilter } from './schedule-filters'
import { eventStatus, useScheduleFilters } from './use-schedule-filters'

type Props = { events: EventSummary[]; days: ShowDay[]; venues: Venue[] }

type Slot = { start: string; events: EventSummary[] }
type DayGroup = { day: string; slots: Slot[] }

function group(events: EventSummary[]): DayGroup[] {
	const days = new Map<string, Map<string, EventSummary[]>>()
	for (const e of events) {
		const slots = days.get(e.day) ?? new Map<string, EventSummary[]>()
		const slot = slots.get(e.start) ?? []
		slot.push(e)
		slots.set(e.start, slot)
		days.set(e.day, slots)
	}
	return [...days.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([day, slots]) => ({
			day,
			slots: [...slots.entries()].sort(([a], [b]) => Date.parse(a) - Date.parse(b)).map(([start, events]) => ({ start, events })),
		}))
}

export function Agenda({ events, days, venues }: Props) {
	const filters = useScheduleFilters(events, days)
	const { filtered, now, isSearching } = filters
	const groups = useMemo(() => group(filtered), [filtered])

	const firstUpcomingSlot = useMemo(() => {
		if (now === null || isSearching) return null
		for (const g of groups) for (const s of g.slots) if (s.events.some(e => eventStatus(e, now) !== 'past')) return s.start
		return null
	}, [groups, now, isSearching])
	const showJumpToNow = firstUpcomingSlot !== null && filters.day === filters.today

	return (
		<div className="flex flex-col gap-4">
			<div className="sticky top-14 z-30 -mx-4 flex flex-col gap-2 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-md">
				<DayTabs days={days} filters={filters} disabled={isSearching} />
				<div className="flex gap-2">
					<div className="min-w-0 flex-1">
						<SearchBox filters={filters} />
					</div>
					<StageFilter venues={venues} filters={filters} />
					<MineToggle filters={filters} />
				</div>
			</div>

			<div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
				<p aria-live="polite">
					{isSearching ? `${filtered.length} result${filtered.length === 1 ? '' : 's'} for “${filters.query}”` : `${filtered.length} events`}
					{filters.activeFilterCount > 0 && ' (filtered)'}
				</p>
				<div className="flex items-center gap-2">
					{showJumpToNow && (
						<Button
							variant="secondary"
							size="sm"
							onClick={() => document.getElementById(`slot-${firstUpcomingSlot}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
						>
							<ArrowDownIcon data-icon="inline-start" />
							Jump to now
						</Button>
					)}
					<span>Times in {showZoneLabel()}</span>
				</div>
			</div>

			{groups.length === 0 ? (
				<Empty className="border border-dashed">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<SearchXIcon />
						</EmptyMedia>
						<EmptyTitle>Nothing matches</EmptyTitle>
						<EmptyDescription>
							{filters.params.mine ? 'None of your saved events match these filters.' : 'Try a different search or clear the stage filter.'}
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button variant="outline" onClick={() => filters.setParams({ q: null, stages: null, mine: null })}>
							Clear filters
						</Button>
					</EmptyContent>
				</Empty>
			) : (
				groups.map(g => (
					<section key={g.day} aria-labelledby={`day-${g.day}`} className="flex flex-col gap-3">
						{isSearching && (
							<h2 id={`day-${g.day}`} className="text-lg font-bold">
								{formatDayLong(g.day)}
							</h2>
						)}
						{!isSearching && (
							<h2 id={`day-${g.day}`} className="sr-only">
								{formatDayLong(g.day)}
							</h2>
						)}
						{g.slots.map(slot => (
							<div
								key={slot.start}
								id={`slot-${slot.start}`}
								className="grid scroll-mt-48 grid-cols-[4.5rem_1fr] gap-3 [content-visibility:auto] [contain-intrinsic-size:auto_6rem] sm:grid-cols-[6rem_1fr]"
							>
								<div className="pt-3 text-right text-sm font-semibold text-primary tabular-nums">{formatTime(slot.start)}</div>
								<ul className="flex flex-col gap-2">
									{slot.events.map(e => (
										<EventRow key={e.id} event={e} status={eventStatus(e, now)} showSnippet={isSearching} />
									))}
								</ul>
							</div>
						))}
					</section>
				))
			)}
		</div>
	)
}
