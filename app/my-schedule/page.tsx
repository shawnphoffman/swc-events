import { Suspense } from 'react'
import type { Metadata } from 'next'

import { PageHeader } from '@/components/page-header'
import { ListSkeleton } from '@/components/schedule/list-skeleton'
import { MySchedule } from '@/components/schedule/my-schedule'
import { ScheduleNotPublished, ScheduleStatusBanner } from '@/components/schedule/schedule-status'
import { celebration } from '@/lib/celebration'
import { getSchedule } from '@/lib/schedule/source'
import { toSummaries } from '@/lib/schedule/summary'

export const metadata: Metadata = {
	title: 'My Schedule',
	description: `Your saved ${celebration.shortName} panels, with conflict warnings and calendar export.`,
}

export default async function MySchedulePage() {
	const schedule = await getSchedule()
	return (
		<div className="flex flex-col gap-4">
			<PageHeader title="My Schedule" description="Saved on this device. Export to your calendar or share with your crew." />
			<ScheduleStatusBanner status={schedule.status} />
			{schedule.events.length === 0 ? (
				<ScheduleNotPublished />
			) : (
				<Suspense fallback={<ListSkeleton rows={4} />}>
					<MySchedule events={toSummaries(schedule)} />
				</Suspense>
			)}
		</div>
	)
}
