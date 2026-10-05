import { CalendarXIcon } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export default function EventNotFound() {
	return (
		<Empty className="border border-dashed">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<CalendarXIcon />
				</EmptyMedia>
				<EmptyTitle>That event isn&apos;t on the schedule</EmptyTitle>
				<EmptyDescription>It may have been cancelled or moved. Check the full schedule for the latest.</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button asChild>
					<Link href="/schedule">Browse the schedule</Link>
				</Button>
			</EmptyContent>
		</Empty>
	)
}
