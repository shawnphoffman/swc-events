'use client'

import { TriangleAlertIcon } from 'lucide-react'
import Link from 'next/link'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useFavorites } from '@/hooks/use-favorites'
import type { EventSummary } from '@/lib/schedule/summary'
import { formatTimeRange } from '@/lib/time'

/** Warns when an event overlaps something already in the visitor's schedule. */
export function ConflictNotice({ eventId, overlapping }: { eventId: string; overlapping: EventSummary[] }) {
	const { ids } = useFavorites()
	const conflicts = overlapping.filter(e => e.id !== eventId && ids.includes(e.id))
	if (conflicts.length === 0) return null
	return (
		<Alert variant="destructive">
			<TriangleAlertIcon />
			<AlertTitle>Overlaps with your schedule</AlertTitle>
			<AlertDescription>
				<ul className="flex flex-col gap-1">
					{conflicts.map(c => (
						<li key={c.id}>
							<Link href={`/event/${c.id}`} className="font-medium underline underline-offset-2">
								{c.title}
							</Link>{' '}
							<span className="tabular-nums">({formatTimeRange(c.start, c.end)}, {c.venue})</span>
						</li>
					))}
				</ul>
			</AlertDescription>
		</Alert>
	)
}
