import './globals.css'

import { Suspense } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import { SignInDialog } from '@/components/auth/sign-in-dialog'
import { SyncAgent } from '@/components/auth/sync-agent'
import { MobileTabBar, SiteHeader } from '@/components/site-nav'
import { Starfield } from '@/components/starfield'
import { Toaster } from '@/components/ui/sonner'
import { celebration } from '@/lib/celebration'

const sans = Geist({ subsets: ['latin'], variable: '--font-sans' })
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

function siteOrigin() {
	if (process.env.VERCEL_ENV === 'production') return celebration.siteUrl
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
	return `http://localhost:${process.env.PORT ?? 3000}`
}

const description = `An unofficial, no-frills ${celebration.shortName} companion. Browse and search panels, build your own schedule, and add it to your calendar.`

export const metadata: Metadata = {
	metadataBase: new URL(siteOrigin()),
	title: { default: celebration.appName, template: `%s | ${celebration.shortName}` },
	description,
	applicationName: celebration.appName,
	openGraph: { title: celebration.appName, description, type: 'website', url: '/', locale: 'en_US', siteName: 'swc.events' },
	twitter: { card: 'summary_large_image', creator: '@iceplanethoff' },
	appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'SWC 2027' },
}

export const viewport: Viewport = {
	themeColor: '#0b0d17',
	colorScheme: 'dark',
	viewportFit: 'cover',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
	return (
		<html lang="en" className={`dark ${sans.variable} ${mono.variable}`}>
			<body className="min-h-dvh antialiased">
				<NuqsAdapter>
					<Starfield />
					<SiteHeader />
					<main className="mx-auto flex w-full max-w-6xl flex-col px-4 pt-4 pb-28 md:pb-12">{children}</main>
					<MobileTabBar />
					<Toaster position="top-center" />
					<SyncAgent />
					{/* usePathname() inside; keep it out of the prerendered shell's blocking path */}
					<Suspense>
						<SignInDialog />
					</Suspense>
				</NuqsAdapter>
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	)
}
