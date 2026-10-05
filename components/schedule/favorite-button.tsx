'use client'

import { HeartIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useFavorites } from '@/hooks/use-favorites'
import { cn } from '@/lib/utils'

type Props = {
	id: string
	title: string
	size?: 'icon' | 'icon-lg' | 'default'
	showLabel?: boolean
	className?: string
}

export function FavoriteButton({ id, title, size = 'icon', showLabel = false, className }: Props) {
	const { has, toggle } = useFavorites()
	const active = has(id)
	return (
		<Button
			type="button"
			variant={showLabel ? 'outline' : 'ghost'}
			size={showLabel ? 'default' : size}
			aria-pressed={active}
			aria-label={showLabel ? undefined : active ? `Remove ${title} from my schedule` : `Add ${title} to my schedule`}
			onClick={e => {
				// Rows are links; keep the heart from navigating.
				e.preventDefault()
				e.stopPropagation()
				toggle(id)
			}}
			className={cn('shrink-0', active && 'text-favorite hover:text-favorite', className)}
		>
			<HeartIcon data-icon={showLabel ? 'inline-start' : undefined} className={cn(active && 'fill-current')} />
			{showLabel && (active ? 'In my schedule' : 'Add to my schedule')}
		</Button>
	)
}
