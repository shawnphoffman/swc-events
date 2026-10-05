import { TriangleAlertIcon } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import type { EventSummary } from '@/lib/schedule/summary'
import { venueColor } from '@/lib/schedule/summary'
import { formatDuration, formatTimeRange } from '@/lib/time'
import { cn } from '@/lib/utils'

import { FavoriteButton } from './favorite-button'

type Props = {
	event: EventSummary
	status?: 'past' | 'live' | 'upcoming'
	conflict?: boolean
	showSnippet?: boolean
}

export function EventRow({ event, status = 'upcoming', conflict = false, showSnippet = false }: Props) {
	const duration = formatDuration(event.start, event.end)
	return (
		<li className={cn('group relative', status === 'past' && 'opacity-55')}>
			{/* Stretched-link card: the title link covers the row, the heart stays a separate control (no button-in-link). */}
			<div className="flex items-stretch gap-3 rounded-lg border border-border/70 bg-card py-2.5 pr-1.5 pl-3 shadow-sm transition-colors group-hover:border-border group-hover:bg-accent/70 has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
				<span aria-hidden className="w-1 shrink-0 rounded-full" style={{ background: venueColor(event.colorIndex) }} />
				<span className="flex min-w-0 flex-1 flex-col gap-1">
					<span className="flex items-start gap-2">
						<Link href={`/event/${event.id}`} className="leading-snug font-semibold text-pretty outline-none after:absolute after:inset-0 after:rounded-lg">
							{event.title}
						</Link>
						{status === 'live' && (
							<Badge className="mt-0.5 shrink-0 animate-pulse motion-reduce:animate-none">Live</Badge>
						)}
					</span>
					<span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
						<span className="tabular-nums">{formatTimeRange(event.start, event.end)}</span>
						{duration && <span className="text-muted-foreground/70">{duration}</span>}
						<span className="flex min-w-0 items-center gap-1.5">
							<span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: venueColor(event.colorIndex) }} />
							<span className="truncate">{event.venue}</span>
						</span>
						{conflict && (
							<span className="flex items-center gap-1 text-destructive">
								<TriangleAlertIcon className="size-3.5" aria-hidden />
								Overlaps
							</span>
						)}
					</span>
					{showSnippet && event.snippet && <span className="line-clamp-2 text-sm text-muted-foreground/80">{event.snippet}</span>}
				</span>
				<FavoriteButton id={event.id} title={event.title} className="relative z-10 self-center" />
			</div>
		</li>
	)
}
