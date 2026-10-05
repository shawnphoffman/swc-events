import { CalendarClockIcon, FlaskConicalIcon, TriangleAlertIcon } from 'lucide-react'
import Link from 'next/link'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { celebration } from '@/lib/celebration'
import type { Schedule } from '@/lib/schedule/types'

export function ScheduleStatusBanner({ status }: { status: Schedule['status'] }) {
	if (status === 'sample') {
		return (
			<Alert>
				<FlaskConicalIcon />
				<AlertTitle>Sample data</AlertTitle>
				<AlertDescription>
					The official {celebration.year} schedule isn&apos;t out yet. You&apos;re looking at generated placeholder panels for testing.
				</AlertDescription>
			</Alert>
		)
	}
	if (status === 'error') {
		return (
			<Alert variant="destructive">
				<TriangleAlertIcon />
				<AlertTitle>Couldn&apos;t reach the official schedule</AlertTitle>
				<AlertDescription>We&apos;ll keep trying. Your saved events are stored on this device and aren&apos;t affected.</AlertDescription>
			</Alert>
		)
	}
	return null
}

export function ScheduleNotPublished() {
	return (
		<Empty className="border border-dashed">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<CalendarClockIcon />
				</EmptyMedia>
				<EmptyTitle>The {celebration.year} schedule hasn&apos;t been published yet</EmptyTitle>
				<EmptyDescription>
					Panels usually go live a few weeks before the show. This page will fill in automatically as soon as they do.
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button asChild variant="outline">
					<Link href="/countdown">See the countdown</Link>
				</Button>
			</EmptyContent>
		</Empty>
	)
}
