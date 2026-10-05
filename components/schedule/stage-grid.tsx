'use client'

import type { CSSProperties } from 'react'
import { HeartIcon } from 'lucide-react'
import Link from 'next/link'

import { useFavorites } from '@/hooks/use-favorites'
import type { EventSummary } from '@/lib/schedule/summary'
import { venueColor } from '@/lib/schedule/summary'
import type { ShowDay, Venue } from '@/lib/schedule/types'
import { formatTimeRange, minutesIntoShowDay, showZoneLabel } from '@/lib/time'
import { cn } from '@/lib/utils'

import { DayTabs, MineToggle, StageFilter } from './schedule-filters'
import { eventStatus, useScheduleFilters } from './use-schedule-filters'

const SLOT_MINUTES = 5
const ROW_REM = 0.5 // 5 minutes => 0.5rem, so an hour is 6rem tall

type Props = { events: EventSummary[]; days: ShowDay[]; venues: Venue[] }

export function StageGrid({ events, days, venues }: Props) {
	const filters = useScheduleFilters(events, days)
	const favorites = useFavorites()
	const { day, now } = filters

	// The grid ignores free-text search; it's a spatial overview of one day.
	const stageSet = new Set(filters.params.stages)
	const dayEvents = events.filter(
		e => e.day === day && (stageSet.size === 0 || stageSet.has(e.venueSlug)) && (!filters.params.mine || favorites.has(e.id))
	)
	const used = new Set(dayEvents.map(e => e.venueSlug))
	const columns = venues.filter(v => used.has(v.slug))

	if (dayEvents.length === 0 || !day) {
		return (
			<div className="flex flex-col gap-3">
				<GridToolbar days={days} venues={venues} filters={filters} />
				<p className="py-12 text-center text-muted-foreground">Nothing scheduled for these filters.</p>
			</div>
		)
	}

	const starts = dayEvents.map(e => minutesIntoShowDay(e.start))
	const ends = dayEvents.map(e => Math.max(minutesIntoShowDay(e.end), minutesIntoShowDay(e.start) + 15))
	const dayStart = Math.floor(Math.min(...starts) / 60) * 60
	const dayEnd = Math.ceil(Math.max(...ends) / 60) * 60
	const rows = (dayEnd - dayStart) / SLOT_MINUTES
	const row = (minutes: number) => Math.round((minutes - dayStart) / SLOT_MINUTES) + 2 // +1 header row, +1 for 1-based lines
	const hours = Array.from({ length: (dayEnd - dayStart) / 60 }, (_, i) => dayStart + i * 60)
	const colIndex = new Map(columns.map((v, i) => [v.slug, i + 2]))

	const nowMinutes = now !== null && day === filters.today ? minutesIntoShowDay(new Date(now).toISOString()) : null
	const showNowLine = nowMinutes !== null && nowMinutes >= dayStart && nowMinutes <= dayEnd

	return (
		<div className="flex flex-col gap-3">
			<GridToolbar days={days} venues={venues} filters={filters} />
			<div
				className="relative -mx-4 max-h-[calc(100dvh-15rem)] overflow-auto overscroll-contain rounded-none border-y border-border/60 bg-background/60 sm:mx-0 sm:rounded-xl sm:border"
				tabIndex={0}
				aria-label="Stage schedule grid"
			>
				<div
					className="grid"
					style={{
						gridTemplateColumns: `3.5rem repeat(${columns.length}, minmax(10.5rem, 1fr))`,
						gridTemplateRows: `auto repeat(${rows}, ${ROW_REM}rem)`,
					}}
				>
					{/* Corner + stage headers */}
					<div className="sticky top-0 left-0 z-30 border-r border-b border-border/60 bg-background/95" style={{ gridColumn: 1, gridRow: 1 }}>
						<span className="flex h-full items-end justify-center pb-2 text-[10px] text-muted-foreground">{showZoneLabel()}</span>
					</div>
					{columns.map((v, i) => (
						<div
							key={v.slug}
							className="sticky top-0 z-20 flex items-center gap-2 border-b border-border/60 bg-background/95 px-2 py-2.5 text-sm font-semibold backdrop-blur"
							style={{ gridColumn: i + 2, gridRow: 1 }}
						>
							<span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: venueColor(v.colorIndex) }} />
							<span className="truncate" title={v.name}>
								{v.name}
							</span>
						</div>
					))}

					{/* Hour labels + gridlines */}
					{hours.map(h => (
						<div key={h} className="contents">
							<div
								className="sticky left-0 z-10 border-r border-border/60 bg-background/95 pr-1.5 text-right text-xs text-muted-foreground tabular-nums"
								style={{ gridColumn: 1, gridRow: `${row(h)} / span ${60 / SLOT_MINUTES}` }}
							>
								<span className="relative -top-2">{h === dayStart ? '' : formatHour(h)}</span>
							</div>
							<div
								aria-hidden
								className="border-t border-border/40"
								style={{ gridColumn: `2 / span ${columns.length}`, gridRow: `${row(h)} / span ${60 / SLOT_MINUTES}` }}
							/>
						</div>
					))}

					{/* Events */}
					{dayEvents.map(e => {
						const col = colIndex.get(e.venueSlug)
						if (!col) return null
						const startMin = minutesIntoShowDay(e.start)
						const endMin = Math.max(minutesIntoShowDay(e.end), startMin + 15)
						const status = eventStatus(e, now)
						const favorite = favorites.has(e.id)
						return (
							<Link
								key={e.id}
								href={`/event/${e.id}`}
								className={cn(
									'group relative z-0 m-0.5 flex flex-col gap-0.5 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-xs transition-colors hover:z-10 focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
									status === 'past' && 'opacity-50',
									favorite && 'ring-2 ring-favorite/80'
								)}
								style={
									{
										gridColumn: col,
										gridRow: `${row(startMin)} / ${row(endMin)}`,
										borderLeftColor: venueColor(e.colorIndex),
										background: `color-mix(in oklch, ${venueColor(e.colorIndex)} 16%, var(--card))`,
									} as CSSProperties
								}
							>
								<span className="flex items-start gap-1">
									<span className="line-clamp-3 flex-1 leading-tight font-semibold">{e.title}</span>
									{favorite && <HeartIcon className="mt-px size-3 shrink-0 fill-favorite text-favorite" aria-label="In my schedule" />}
								</span>
								<span className="text-muted-foreground tabular-nums">{formatTimeRange(e.start, e.end)}</span>
							</Link>
						)
					})}

					{showNowLine && (
						<div
							aria-hidden
							className="pointer-events-none relative z-20 col-start-2 -col-end-1 border-t-2 border-favorite"
							style={{ gridRow: row(nowMinutes!) }}
						>
							<span className="absolute -top-1.5 -left-1.5 size-3 rounded-full bg-favorite" />
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

/** Hour label from minutes-since-midnight at the venue, e.g. 600 -> "10am". */
function formatHour(minutes: number) {
	const h = Math.floor(minutes / 60) % 24
	return `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}`
}

function GridToolbar({ days, venues, filters }: { days: ShowDay[]; venues: Venue[]; filters: ReturnType<typeof useScheduleFilters> }) {
	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
			<div className="flex-1">
				<DayTabs days={days} filters={filters} />
			</div>
			<div className="flex gap-2">
				<StageFilter venues={venues} filters={filters} />
				<MineToggle filters={filters} />
			</div>
		</div>
	)
}
