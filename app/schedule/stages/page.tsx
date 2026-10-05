import { Suspense } from 'react'
import type { Metadata } from 'next'

import { PageHeader } from '@/components/page-header'
import { ListSkeleton } from '@/components/schedule/list-skeleton'
import { ScheduleNotPublished, ScheduleStatusBanner } from '@/components/schedule/schedule-status'
import { StageGrid } from '@/components/schedule/stage-grid'
import { celebration } from '@/lib/celebration'
import { getSchedule } from '@/lib/schedule/source'
import { toSummaries } from '@/lib/schedule/summary'

export const metadata: Metadata = {
	title: 'Stages',
	description: `Every ${celebration.shortName} stage side by side, hour by hour.`,
}

export default async function StagesPage() {
	const schedule = await getSchedule()
	return (
		<div className="flex flex-col gap-4">
			<PageHeader title="Stages" description="Every stage side by side. Scroll sideways for more rooms." />
			<ScheduleStatusBanner status={schedule.status} />
			{schedule.events.length === 0 ? (
				<ScheduleNotPublished />
			) : (
				<Suspense fallback={<ListSkeleton rows={6} />}>
					<StageGrid events={toSummaries(schedule)} days={schedule.days} venues={schedule.venues} />
				</Suspense>
			)}
		</div>
	)
}
