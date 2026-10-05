import { Suspense } from 'react'
import { HeartIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/page-header'
import { EventRow } from '@/components/schedule/event-row'
import { ListSkeleton } from '@/components/schedule/list-skeleton'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { celebration } from '@/lib/celebration'
import { getPublicProfile } from '@/lib/profiles'
import { getSchedule } from '@/lib/schedule/source'
import { toSummaries } from '@/lib/schedule/summary'
import { formatDayLong } from '@/lib/time'

export async function generateMetadata({ params }: PageProps<'/u/[handle]'>): Promise<Metadata> {
	const { handle } = await params
	const profile = await getPublicProfile(handle)
	if (!profile) return { title: 'Schedule not found', robots: { index: false } }
	const name = profile.displayName ?? profile.handle
	return {
		title: `${name}’s schedule`,
		description: `${profile.eventIds.length} events ${name} is planning to see at ${celebration.shortName}.`,
		robots: { index: false },
	}
}

export default function PublicSchedulePage({ params }: PageProps<'/u/[handle]'>) {
	return (
		<Suspense fallback={<ListSkeleton rows={4} />}>
			<PublicSchedule params={params} />
		</Suspense>
	)
}

async function PublicSchedule({ params }: { params: PageProps<'/u/[handle]'>['params'] }) {
	const { handle } = await params
	const [profile, schedule] = await Promise.all([getPublicProfile(handle), getSchedule()])
	if (!profile) notFound()

	const wanted = new Set(profile.eventIds)
	const events = toSummaries(schedule).filter(e => wanted.has(e.id))
	const days = [...new Set(events.map(e => e.day))].sort()
	const name = profile.displayName ?? profile.handle

	return (
		<div className="flex flex-col gap-4">
			<PageHeader
				title={`${name}’s schedule`}
				description={`${events.length} events at ${celebration.shortName}`}
				actions={
					events.length > 0 && (
						<Button asChild>
							<Link href={`/my-schedule?shared=${events.map(e => e.id).join(',')}`}>
								<HeartIcon data-icon="inline-start" />
								Copy to my schedule
							</Link>
						</Button>
					)
				}
			/>
			{events.length === 0 ? (
				<Empty className="border border-dashed">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<HeartIcon />
						</EmptyMedia>
						<EmptyTitle>Nothing saved yet</EmptyTitle>
						<EmptyDescription>{name} hasn&apos;t saved any {celebration.year} events.</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				days.map(day => (
					<section key={day} className="flex flex-col gap-2">
						<h2 className="text-lg font-bold">{formatDayLong(day)}</h2>
						<ul className="flex flex-col gap-2">
							{events
								.filter(e => e.day === day)
								.map(e => (
									<EventRow key={e.id} event={e} />
								))}
						</ul>
					</section>
				))
			)}
		</div>
	)
}
