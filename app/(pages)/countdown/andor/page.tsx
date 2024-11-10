import './overrides.css'

import { Suspense } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'

import andorLogo from './andor.png'
import Countdown from './Countdown'

const defaultUrl = process.env.VERCEL_URL ? `https://swc.events/` : 'http://localhost:3000'

export const metadata: Metadata = {
	metadataBase: new URL(defaultUrl),
	title: `Countdown to Andor Season 2`,
	description: 'Countdown to Andor Season 2',
	openGraph: {
		title: `Countdown to Andor Season 2`,
		description: 'Countdown to Andor Season 2',
		type: 'website',
		url: '/countdown/andor',
		// images: ['https://swc.events/api/og'],
		locale: 'en_US',
	},
}

export default async function CountdownPage() {
	return (
		<div className="flex flex-col items-center gap-4 font-bold text-center md:gap-8">
			<Image src={andorLogo} alt="Countdown to Andor Season 2" width={400} className="z-10" />
			<Suspense>
				<Countdown />
			</Suspense>
		</div>
	)
}
