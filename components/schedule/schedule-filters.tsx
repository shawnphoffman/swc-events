'use client'

import { CheckIcon, HeartIcon, ListFilterIcon, SearchIcon, XIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Toggle } from '@/components/ui/toggle'
import { venueColor } from '@/lib/schedule/summary'
import type { ShowDay, Venue } from '@/lib/schedule/types'
import { formatDayNumber, formatDayShort } from '@/lib/time'
import { cn } from '@/lib/utils'

import type { useScheduleFilters } from './use-schedule-filters'

type Filters = ReturnType<typeof useScheduleFilters>

export function DayTabs({ days, filters, disabled = false }: { days: ShowDay[]; filters: Filters; disabled?: boolean }) {
	return (
		<div role="tablist" aria-label="Show day" className={cn('grid gap-1 rounded-xl bg-muted/70 p-1', disabled && 'opacity-50')} style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
			{days.map(d => {
				const selected = d.date === filters.day
				return (
					<button
						key={d.date}
						type="button"
						role="tab"
						aria-selected={selected}
						disabled={disabled}
						onClick={() => filters.setParams({ day: d.date })}
						className={cn(
							'flex flex-col items-center rounded-lg px-2 py-1.5 text-sm transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
							selected ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
						)}
					>
						<span className="font-semibold">
							{formatDayShort(d.date)}
							{d.date === filters.today && <span className="sr-only"> (today)</span>}
						</span>
						<span className={cn('text-xs tabular-nums', selected ? 'text-primary-foreground/80' : 'text-muted-foreground/80')}>{formatDayNumber(d.date)}</span>
					</button>
				)
			})}
		</div>
	)
}

export function SearchBox({ filters }: { filters: Filters }) {
	return (
		<InputGroup className="bg-card">
			<InputGroupAddon>
				<SearchIcon />
			</InputGroupAddon>
			<InputGroupInput
				type="search"
				inputMode="search"
				enterKeyHint="search"
				placeholder="Search panels, guests, stages"
				aria-label="Search the schedule"
				value={filters.params.q}
				onChange={e => filters.setParams({ q: e.target.value || null })}
			/>
			{filters.params.q && (
				<InputGroupAddon align="inline-end">
					<InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => filters.setParams({ q: null })}>
						<XIcon />
					</InputGroupButton>
				</InputGroupAddon>
			)}
		</InputGroup>
	)
}

export function StageFilter({ venues, filters }: { venues: Venue[]; filters: Filters }) {
	const selected = new Set(filters.params.stages)
	const toggle = (slug: string) => {
		const next = new Set(selected)
		if (next.has(slug)) next.delete(slug)
		else next.add(slug)
		filters.setParams({ stages: next.size ? [...next] : null })
	}
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" className="h-9 bg-card">
					<ListFilterIcon data-icon="inline-start" />
					Stages
					{selected.size > 0 && <Badge className="ml-0.5 h-5 min-w-5 px-1 tabular-nums">{selected.size}</Badge>}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-72 p-0">
				<Command>
					<CommandInput placeholder="Find a stage" />
					<CommandList>
						<CommandEmpty>No stages found.</CommandEmpty>
						<CommandGroup>
							{venues.map(v => (
								<CommandItem key={v.slug} value={v.name} onSelect={() => toggle(v.slug)} data-checked={selected.has(v.slug)}>
									<span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: venueColor(v.colorIndex) }} />
									<span className="flex-1 truncate">{v.name}</span>
									<span className="text-xs text-muted-foreground tabular-nums">{v.eventCount}</span>
									<CheckIcon className={cn('size-4', selected.has(v.slug) ? 'opacity-100' : 'opacity-0')} />
								</CommandItem>
							))}
						</CommandGroup>
						{selected.size > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem onSelect={() => filters.setParams({ stages: null })} className="justify-center text-muted-foreground">
										Show all stages
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}

export function MineToggle({ filters }: { filters: Filters }) {
	return (
		<Toggle
			variant="outline"
			className="h-9 bg-card data-[state=on]:text-favorite"
			pressed={filters.params.mine}
			onPressedChange={mine => filters.setParams({ mine: mine || null })}
			aria-label="Only show my schedule"
		>
			<HeartIcon className={cn(filters.params.mine && 'fill-current')} />
			<span className="hidden sm:inline">Mine</span>
		</Toggle>
	)
}
