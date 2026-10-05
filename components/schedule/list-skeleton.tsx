import { Skeleton } from '@/components/ui/skeleton'

export function ListSkeleton({ rows = 8 }: { rows?: number }) {
	return (
		<div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading">
			<Skeleton className="h-14 w-full rounded-xl" />
			<Skeleton className="h-9 w-full" />
			<div className="flex flex-col gap-2">
				{Array.from({ length: rows }, (_, i) => (
					<Skeleton key={i} className="h-16 w-full" />
				))}
			</div>
		</div>
	)
}
