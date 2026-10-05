import type { Metadata } from 'next'
import Image from 'next/image'

import { Countdown } from '@/components/countdown'

import andorLogo from './andor.png'
import { andorPremiere } from './config'

export const metadata: Metadata = {
	title: 'Countdown to Andor Season 2',
	description: 'Countdown to Andor Season 2',
	openGraph: { title: 'Countdown to Andor Season 2', description: 'Countdown to Andor Season 2', url: '/countdown/andor' },
}

export default function AndorCountdownPage() {
	return (
		// Scoped backdrop instead of a global body override, so it no longer leaks into other pages on client navigation.
		<div className="fixed inset-0 overflow-y-auto bg-linear-to-b from-stone-900 via-stone-950 to-red-950">
			<div className="flex flex-col items-center gap-6 px-4 pt-20 pb-28 text-center md:gap-10">
				<Image src={andorLogo} alt="Countdown to Andor Season 2" width={400} priority className="h-auto w-72 sm:w-96" />
				<Countdown
					target={andorPremiere}
					colors={['#f87171', '#991b1b']}
					textColor="#fca5a5"
					whenDone={<p className="text-4xl font-black text-red-300 text-shadow-glow">Andor Season 2 has premiered.</p>}
				/>
			</div>
		</div>
	)
}
