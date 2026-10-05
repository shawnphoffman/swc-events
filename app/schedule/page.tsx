import { Suspense } from 'react'
import type { Metadata } from 'next'

import { PageHeader } from '@/components/page-header'
import { Agenda } from '@/components/schedule/agenda'
import { ListSkeleton } from '@/components/schedule/list-skeleton'
import { ScheduleNotPublished, ScheduleStatusBanner } from '@/components/schedule/schedule-status'
import { celebration } from '@/lib/celebration'
import { getSchedule } from '@/lib/schedule/source'
import { toSummaries } from '@/lib/schedule/summary'

export const metadata: Metadata = {
	title: 'Schedule',
	description: `Every ${celebration.shortName} panel, searchable and filterable by day and stage.`,
}

export default async function SchedulePage() {
	const schedule = await getSchedule()
	return (
		<div className="flex flex-col gap-4">
			<PageHeader title="Schedule" description={`${celebration.location} · ${schedule.events.length} events`} />
			<ScheduleStatusBanner status={schedule.status} />
			{schedule.events.length === 0 ? (
				<ScheduleNotPublished />
			) : (
				<Suspense fallback={<ListSkeleton />}>
					<Agenda events={toSummaries(schedule)} days={schedule.days} venues={schedule.venues} />
				</Suspense>
			)}
		</div>
	)
}
