import { Suspense } from 'react'
import Image from 'next/image'

import Countdown from './Countdown'
import countdownLogo from './countdown.png'

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
