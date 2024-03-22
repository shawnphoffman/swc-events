import { Suspense } from 'react'

import { FallbackRow } from '@/components/common/Fallbacks'
import ListsByUser from '@/components/lists/ListsByUser'

export default async function Lists() {
	// await new Promise(resolve => setTimeout(resolve, 50000))
	return (
		<div className="flex flex-col flex-1 w-full max-w-4xl px-3 opacity-0 animate-in">
			<div className="flex flex-col flex-1 gap-6">
				<h1>Wish Lists</h1>
				<Suspense fallback={<FallbackRow label="Loading..." />}>
					<ListsByUser />
				</Suspense>
			</div>
		</div>
	)
}
