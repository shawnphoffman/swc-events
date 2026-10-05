import { Suspense } from 'react'
import { FlaskConicalIcon, StoreIcon } from 'lucide-react'
import type { Metadata } from 'next'

import { PageHeader } from '@/components/page-header'
import { ListSkeleton } from '@/components/schedule/list-skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { VendorList } from '@/components/vendors/vendor-list'
import { celebration } from '@/lib/celebration'
import { getVendors } from '@/lib/schedule/source'

export const metadata: Metadata = {
	title: 'Vendors',
	description: `Exhibitors, booths and show specials at ${celebration.shortName}.`,
}

export default async function VendorsPage() {
	const { vendors, status } = await getVendors()
	return (
		<div className="flex flex-col gap-4">
			<PageHeader title="Vendors" description="Find a booth, bookmark the ones you want to hit, and check show specials." />
			{status === 'sample' && (
				<Alert>
					<FlaskConicalIcon />
					<AlertTitle>Sample data</AlertTitle>
					<AlertDescription>The {celebration.year} exhibitor list isn&apos;t out yet. These are placeholders for testing.</AlertDescription>
				</Alert>
			)}
			{vendors.length === 0 ? (
				<Empty className="border border-dashed">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<StoreIcon />
						</EmptyMedia>
						<EmptyTitle>Exhibitors haven&apos;t been announced yet</EmptyTitle>
						<EmptyDescription>{status === 'error' ? 'The exhibitor feed is unavailable right now.' : 'Check back closer to the show.'}</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<Suspense fallback={<ListSkeleton rows={6} />}>
					<VendorList vendors={vendors} />
				</Suspense>
			)}
		</div>
	)
}
