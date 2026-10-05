'use client'

import { useDeferredValue, useMemo } from 'react'
import Fuse from 'fuse.js'
import { useQueryStates } from 'nuqs'

import { useFavorites } from '@/hooks/use-favorites'
import { useNow } from '@/hooks/use-now'
import { scheduleSearchParams } from '@/lib/schedule/search-params'
import type { EventSummary } from '@/lib/schedule/summary'
import type { ShowDay } from '@/lib/schedule/types'
import { showDateOf } from '@/lib/time'

export function useScheduleFilters(events: EventSummary[], days: ShowDay[]) {
	const [params, setParams] = useQueryStates(scheduleSearchParams, { history: 'replace', scroll: false })
	const favorites = useFavorites()
	const now = useNow(30_000)
	const query = useDeferredValue(params.q.trim())

	// No explicit day: during the show open today, otherwise the first day.
	const today = now === null ? null : showDateOf(now)
	const defaultDay = (today && days.find(d => d.date === today)?.date) ?? days[0]?.date ?? null
	const day = params.day && days.some(d => d.date === params.day) ? params.day : defaultDay

	const fuse = useMemo(
		() =>
			new Fuse(events, {
				keys: [
					{ name: 'title', weight: 0.6 },
					{ name: 'venue', weight: 0.2 },
					{ name: 'snippet', weight: 0.2 },
				],
				threshold: 0.32,
				ignoreLocation: true,
				minMatchCharLength: 2,
			}),
		[events]
	)

	const filtered = useMemo(() => {
		const stageSet = new Set(params.stages)
		const favoriteSet = new Set(favorites.ids)
		// Search spans every day; browsing is one day at a time.
		const base = query.length >= 2 ? fuse.search(query).map(r => r.item) : events.filter(e => e.day === day)
		return base.filter(e => (stageSet.size === 0 || stageSet.has(e.venueSlug)) && (!params.mine || favoriteSet.has(e.id)))
	}, [events, fuse, query, day, params.stages, params.mine, favorites.ids])

	const activeFilterCount = params.stages.length + (params.mine ? 1 : 0)

	return { params, setParams, day, today, now, query, filtered, activeFilterCount, isSearching: query.length >= 2 }
}

export function eventStatus(event: Pick<EventSummary, 'start' | 'end'>, now: number | null): 'past' | 'live' | 'upcoming' {
	if (now === null) return 'upcoming'
	const start = Date.parse(event.start)
	const end = Math.max(Date.parse(event.end), start + 60_000)
	if (now >= end) return 'past'
	if (now >= start) return 'live'
	return 'upcoming'
}
