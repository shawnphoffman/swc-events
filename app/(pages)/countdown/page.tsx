import { Suspense } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'

import Countdown from './Countdown'
import countdownLogo from './countdown.png'

const defaultUrl = process.env.VERCEL_URL ? `https://swc.events/` : 'http://localhost:3000'

export const metadata: Metadata = {
	metadataBase: new URL(defaultUrl),
	title: `Countdown to Celebration 2027`,
	description: 'Countdown to Star Wars Celebration 2027 in Los Angeles!',
	openGraph: {
		title: `Countdown to Celebration 2027`,
		description: 'Countdown to Star Wars Celebration 2027 in Los Angeles!',
		type: 'website',
		url: '/countdown',
		// images: ['https://swc.events/api/og'],
		locale: 'en_US',
	},
}

export default async function CountdownPage() {
	return (
		<div className="flex flex-col items-center gap-4 font-bold text-center md:gap-8">
			<Image src={countdownLogo} alt="Countdown to Star Wars Celebration" width={400} className="z-10" />
			<Suspense>
				<Countdown />
			</Suspense>
		</div>
	)
}
