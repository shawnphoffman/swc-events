'use client'

import { useDeferredValue, useMemo } from 'react'
import Fuse from 'fuse.js'
import { BookmarkIcon, ExternalLinkIcon, SearchIcon, SearchXIcon, StarIcon, XIcon } from 'lucide-react'
import { parseAsBoolean, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useVendorBookmarks } from '@/hooks/use-favorites'
import type { Vendor } from '@/lib/schedule/types'
import { cn } from '@/lib/utils'

const kinds = ['vendors', 'tattoo'] as const

export function VendorList({ vendors }: { vendors: Vendor[] }) {
	const [params, setParams] = useQueryStates(
		{ q: parseAsString.withDefault(''), saved: parseAsBoolean.withDefault(false), kind: parseAsStringLiteral(kinds).withDefault('vendors') },
		{ history: 'replace', scroll: false }
	)
	const bookmarks = useVendorBookmarks()
	const query = useDeferredValue(params.q.trim())
	const hasTattoo = vendors.some(v => v.isTattoo)

	const pool = useMemo(() => vendors.filter(v => (params.kind === 'tattoo') === v.isTattoo), [vendors, params.kind])
	const fuse = useMemo(
		() =>
			new Fuse(pool, {
				keys: [
					{ name: 'company', weight: 0.6 },
					{ name: 'description', weight: 0.25 },
					{ name: 'specials.title', weight: 0.1 },
					{ name: 'booths', weight: 0.05 },
				],
				threshold: 0.3,
				ignoreLocation: true,
			}),
		[pool]
	)
	const results = (query.length >= 2 ? fuse.search(query).map(r => r.item) : pool).filter(v => !params.saved || bookmarks.has(v.id))

	return (
		<div className="flex flex-col gap-4">
			<div className="sticky top-14 z-30 -mx-4 flex flex-col gap-2 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-md sm:flex-row">
				{hasTattoo && (
					<ToggleGroup
						type="single"
						variant="outline"
						value={params.kind}
						onValueChange={value => value && setParams({ kind: value === 'vendors' ? null : (value as (typeof kinds)[number]) })}
						className="bg-card"
					>
						<ToggleGroupItem value="vendors">Exhibitors</ToggleGroupItem>
						<ToggleGroupItem value="tattoo">Tattoo artists</ToggleGroupItem>
					</ToggleGroup>
				)}
				<div className="flex flex-1 gap-2">
					<InputGroup className="bg-card">
						<InputGroupAddon>
							<SearchIcon />
						</InputGroupAddon>
						<InputGroupInput
							type="search"
							placeholder="Search vendors, booths, exclusives"
							aria-label="Search vendors"
							value={params.q}
							onChange={e => setParams({ q: e.target.value || null })}
						/>
						{params.q && (
							<InputGroupAddon align="inline-end">
								<InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => setParams({ q: null })}>
									<XIcon />
								</InputGroupButton>
							</InputGroupAddon>
						)}
					</InputGroup>
					<Toggle
						variant="outline"
						className="h-9 bg-card data-[state=on]:text-primary"
						pressed={params.saved}
						onPressedChange={saved => setParams({ saved: saved || null })}
						aria-label="Only show bookmarked vendors"
					>
						<BookmarkIcon className={cn(params.saved && 'fill-current')} />
						<span className="hidden sm:inline">Saved</span>
					</Toggle>
				</div>
			</div>

			<p className="text-sm text-muted-foreground" aria-live="polite">
				{results.length} {params.kind === 'tattoo' ? 'artists' : 'vendors'}
			</p>

			{results.length === 0 ? (
				<Empty className="border border-dashed">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<SearchXIcon />
						</EmptyMedia>
						<EmptyTitle>No vendors match</EmptyTitle>
						<EmptyDescription>{params.saved ? 'Bookmark vendors to find them here.' : 'Try a different search.'}</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{results.map(v => (
						<li key={v.id} className="[content-visibility:auto] [contain-intrinsic-size:auto_12rem]">
							<VendorCard vendor={v} saved={bookmarks.has(v.id)} onToggle={() => bookmarks.toggle(v.id)} />
						</li>
					))}
				</ul>
			)}
		</div>
	)
}

function VendorCard({ vendor, saved, onToggle }: { vendor: Vendor; saved: boolean; onToggle: () => void }) {
	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					{vendor.featured && <StarIcon className="size-4 shrink-0 fill-primary text-primary" aria-label="Featured" />}
					<span>{vendor.company}</span>
				</CardTitle>
				{vendor.booths.length > 0 && (
					<CardDescription className="flex flex-wrap gap-1">
						{vendor.booths.slice(0, 6).map(b => (
							<Badge key={b} variant="secondary" className="tabular-nums">
								Booth {b}
							</Badge>
						))}
						{vendor.booths.length > 6 && <Badge variant="outline">+{vendor.booths.length - 6}</Badge>}
					</CardDescription>
				)}
				<CardAction>
					<Button
						variant="ghost"
						size="icon"
						aria-pressed={saved}
						aria-label={saved ? `Remove bookmark for ${vendor.company}` : `Bookmark ${vendor.company}`}
						onClick={onToggle}
						className={cn(saved && 'text-primary')}
					>
						<BookmarkIcon className={cn(saved && 'fill-current')} />
					</Button>
				</CardAction>
			</CardHeader>
			{(vendor.description || vendor.specials.length > 0) && (
				<CardContent className="flex flex-col gap-3 text-sm">
					{vendor.imageUrl && (
						// Vendor images come from arbitrary upstream hosts; skip the optimizer rather than allow-listing them.
						// eslint-disable-next-line @next/next/no-img-element
						<img src={vendor.imageUrl} alt="" loading="lazy" className="max-h-28 w-auto self-start rounded-md object-contain" />
					)}
					{vendor.description && <p className="line-clamp-4 whitespace-pre-line text-muted-foreground">{vendor.description}</p>}
					{vendor.specials.length > 0 && (
						<div className="flex flex-col gap-1">
							<p className="font-semibold">Show specials</p>
							<ul className="flex flex-col gap-0.5">
								{vendor.specials.map(s => (
									<li key={s.id} className="flex justify-between gap-2">
										{s.link ? (
											<a href={s.link} target="_blank" rel="noreferrer" className="underline underline-offset-2">
												{s.title}
											</a>
										) : (
											<span>{s.title}</span>
										)}
										{s.price && <span className="text-muted-foreground tabular-nums">{s.price}</span>}
									</li>
								))}
							</ul>
						</div>
					)}
				</CardContent>
			)}
			{vendor.url && (
				<CardFooter className="mt-auto">
					<Button asChild variant="link" className="px-0">
						<a href={vendor.url} target="_blank" rel="noreferrer">
							Visit store
							<ExternalLinkIcon data-icon="inline-end" />
						</a>
					</Button>
				</CardFooter>
			)}
		</Card>
	)
}
