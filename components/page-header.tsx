import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function PageHeader({ title, description, actions, className }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; className?: string }) {
	return (
		<div className={cn('flex flex-wrap items-end justify-between gap-3 pb-2', className)}>
			<div className="flex min-w-0 flex-col gap-1">
				<h1 className="text-3xl font-black tracking-tight text-balance sm:text-4xl">{title}</h1>
				{description && <p className="text-muted-foreground">{description}</p>}
			</div>
			{actions && <div className="flex flex-wrap gap-2">{actions}</div>}
		</div>
	)
}
