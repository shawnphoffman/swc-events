'use client'

import { Suspense } from 'react'
import { CalendarDaysIcon, HeartIcon, InfoIcon, LayoutGridIcon, StoreIcon } from 'lucide-react'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import icon from '@/app/icon.png'
import { AccountButton } from '@/components/auth/account-button'
import { useFavorites } from '@/hooks/use-favorites'
import { cn } from '@/lib/utils'

const links: { href: Route; label: string; short: string; icon: typeof CalendarDaysIcon; match: (p: string) => boolean }[] = [
	{ href: '/schedule', label: 'Schedule', short: 'Schedule', icon: CalendarDaysIcon, match: p => p === '/schedule' || p.startsWith('/event/') },
	{ href: '/schedule/stages', label: 'Stages', short: 'Stages', icon: LayoutGridIcon, match: p => p.startsWith('/schedule/stages') },
	{ href: '/my-schedule', label: 'My Schedule', short: 'Mine', icon: HeartIcon, match: p => p.startsWith('/my-schedule') },
	{ href: '/vendors', label: 'Vendors', short: 'Vendors', icon: StoreIcon, match: p => p.startsWith('/vendors') },
	{ href: '/about', label: 'About', short: 'About', icon: InfoIcon, match: p => p.startsWith('/about') },
]

function FavoriteCount() {
	const { ids } = useFavorites()
	if (ids.length === 0) return null
	return (
		<span className="absolute -top-1 -right-2 min-w-4 rounded-full bg-favorite px-1 text-center text-[10px] leading-4 font-bold text-white tabular-nums">
			{ids.length}
		</span>
	)
}

/**
 * The active-link highlight needs usePathname(), which is request data on dynamic
 * routes. Only that part streams; the fallback renders the same links unhighlighted
 * so the prerendered shell is complete.
 */
function HeaderLinks({ pathname }: { pathname: string }) {
	return links.map(({ href, label, icon: Icon, match }) => {
		const active = match(pathname)
		return (
			<Link
				key={href}
				href={href}
				aria-current={active ? 'page' : undefined}
				className={cn(
					'relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
					active && 'bg-accent text-foreground'
				)}
			>
				<Icon className={cn('size-4', active && 'text-primary')} aria-hidden />
				{label}
				{href === '/my-schedule' && <FavoriteCount />}
			</Link>
		)
	})
}

function TabLinks({ pathname }: { pathname: string }) {
	return links.map(({ href, short, icon: Icon, match }) => {
		const active = match(pathname)
		return (
			<li key={href}>
				<Link
					href={href}
					aria-current={active ? 'page' : undefined}
					className={cn('flex flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted-foreground', active && 'text-primary')}
				>
					<span className="relative">
						<Icon className="size-5" aria-hidden />
						{href === '/my-schedule' && <FavoriteCount />}
					</span>
					{short}
				</Link>
			</li>
		)
	})
}

function WithPathname({ render }: { render: (pathname: string) => React.ReactNode }) {
	return render(usePathname())
}

export function SiteHeader() {
	return (
		<header
			data-print="hide"
			className="sticky top-0 z-40 border-b border-border/60 bg-background/70 pt-[env(safe-area-inset-top)] backdrop-blur-md supports-backdrop-filter:bg-background/55"
		>
			<div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
				<Link href="/" className="flex items-center gap-2 font-black tracking-tight">
					<Image src={icon} alt="" width={28} height={28} className="rounded-md" />
					<span>
						SWC<span className="text-primary">.events</span>
					</span>
				</Link>
				<nav aria-label="Main" className="ml-auto hidden items-center gap-1 md:flex">
					<Suspense fallback={<HeaderLinks pathname="" />}>
						<WithPathname render={pathname => <HeaderLinks pathname={pathname} />} />
					</Suspense>
				</nav>
				<div className="ml-auto md:ml-2">
					<AccountButton />
				</div>
			</div>
		</header>
	)
}

/** Thumb-reachable tab bar for phones; this is how most people use the app on the show floor. */
export function MobileTabBar() {
	return (
		<nav
			aria-label="Main"
			data-print="hide"
			className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
		>
			<ul className="mx-auto grid max-w-md grid-cols-5">
				<Suspense fallback={<TabLinks pathname="" />}>
					<WithPathname render={pathname => <TabLinks pathname={pathname} />} />
				</Suspense>
			</ul>
		</nav>
	)
}
