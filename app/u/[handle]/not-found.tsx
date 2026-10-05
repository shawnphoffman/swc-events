import { UserXIcon } from 'lucide-react'

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export default function PublicScheduleNotFound() {
	return (
		<Empty className="border border-dashed">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<UserXIcon />
				</EmptyMedia>
				<EmptyTitle>No public schedule here</EmptyTitle>
				<EmptyDescription>The handle doesn&apos;t exist, or its owner keeps their schedule private.</EmptyDescription>
			</EmptyHeader>
		</Empty>
	)
}
