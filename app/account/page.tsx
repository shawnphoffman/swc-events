import { Suspense } from 'react'
import type { Metadata } from 'next'

import { AccountSettings } from '@/components/auth/account-settings'
import { PageHeader } from '@/components/page-header'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
	title: 'Account',
	robots: { index: false },
}

export default function AccountPage() {
	return (
		<div className="flex max-w-2xl flex-col gap-4">
			<PageHeader title="Account" description="Sync your schedule and choose what to share." />
			<Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
				<AccountSettings />
			</Suspense>
		</div>
	)
}
