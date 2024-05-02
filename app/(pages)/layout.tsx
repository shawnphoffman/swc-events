import '@/app/(pages)/globals-temp.css'
import '@/app/stars.css'

import { Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from 'next'

import StarBackground from '@/components/StarBackground'

const defaultUrl = process.env.VERCEL_URL ? `https://swc.events` : 'http://localhost:3000'

export const metadata: Metadata = {
	metadataBase: new URL(defaultUrl),
	title: 'Celebration 2025 Companion',
	description: 'A no-frills Celebration 2025 companion. Search and favorite panels, quick reference, and more!',
	openGraph: {
		title: 'Celebration 2025 Companion',
		description: 'A no-frills Celebration 2025 companion. Search and favorite panels, quick reference, and more!',
		type: 'website',
		url: '/',
		locale: 'en_US',
	},
	appleWebApp: {
		statusBarStyle: 'black-translucent',
		title: 'Celebration 2025 Companion',
	},
}

type Props = {
	children: React.ReactNode
}

export default async function RootLayout({ children }: Props) {
	return (
		<html lang="en">
			{/* <head>
				<script src="https://kit.fontawesome.com/166b274226.js" crossOrigin="anonymous" async></script>
			</head> */}
			<body>
				<StarBackground />
				<div className="scroller">
					<Suspense>
						<main className="container flex flex-col pt-4 mx-auto h-dvh">{children}</main>
					</Suspense>
				</div>
				<Analytics />
			</body>
		</html>
	)
}
