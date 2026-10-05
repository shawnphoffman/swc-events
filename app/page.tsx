import { Suspense } from 'react'
import { CalendarDaysIcon, HeartIcon, LayoutGridIcon, StoreIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { ShowStatus } from '@/components/home/show-status'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { celebration } from '@/lib/celebration'
import { getSchedule } from '@/lib/schedule/source'
import { toSummaries } from '@/lib/schedule/summary'
import { formatDayNumber } from '@/lib/time'
import logo from '@/public/swc-2027-logo-lg.png'

const sections = [
	{ href: '/schedule', title: 'Schedule', description: 'Every panel, searchable by day and stage.', icon: CalendarDaysIcon },
	{ href: '/schedule/stages', title: 'Stages', description: 'All rooms side by side, hour by hour.', icon: LayoutGridIcon },
	{ href: '/my-schedule', title: 'My Schedule', description: 'Your picks, conflicts, and calendar export.', icon: HeartIcon },
	{ href: '/vendors', title: 'Vendors', description: 'Booths, exclusives, and bookmarks.', icon: StoreIcon },
] as const

export default async function HomePage() {
	const schedule = await getSchedule()
	return (
		<div className="flex flex-col gap-8 py-4">
			<section className="flex flex-col items-center gap-3 text-center">
				<Image src={logo} alt={`${celebration.name} ${celebration.year}`} priority className="h-auto w-72 drop-shadow-2xl sm:w-96" />
				<p className="text-lg text-muted-foreground">
					{formatDayNumber(celebration.firstDay)} to {formatDayNumber(celebration.lastDay)}, {celebration.year} &middot; {celebration.location}
				</p>
				<p className="max-w-xl text-balance">
					An unofficial, fan-made companion. Build your schedule, spot conflicts, and take it with you, no account required.
				</p>
			</section>

			<Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
				<ShowStatus events={toSummaries(schedule)} />
			</Suspense>

			<nav aria-label="Sections" className="grid gap-3 sm:grid-cols-2">
				{sections.map(({ href, title, description, icon: Icon }) => (
					<Link key={href} href={href} className="group rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
						<Card className="h-full transition-colors group-hover:bg-accent/70">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Icon className="size-5 text-primary" aria-hidden />
									{title}
								</CardTitle>
								<CardDescription>{description}</CardDescription>
							</CardHeader>
						</Card>
					</Link>
				))}
			</nav>
		</div>
	)
}
