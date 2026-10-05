import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Countdown } from '@/components/countdown'
import { Button } from '@/components/ui/button'
import { celebration } from '@/lib/celebration'

import countdownLogo from './countdown.png'

const description = `Countdown to ${celebration.name} ${celebration.year}!`

export const metadata: Metadata = {
	title: `Countdown to ${celebration.shortName}`,
	description,
	openGraph: { title: `Countdown to ${celebration.shortName}`, description, url: '/countdown' },
}

export default function CountdownPage() {
	return (
		<div className="flex flex-col items-center gap-6 py-6 text-center md:gap-10">
			<Image src={countdownLogo} alt={`${celebration.name} countdown`} width={400} priority className="h-auto w-72 sm:w-96" />
			<Countdown
				target={celebration.startsAt}
				whenDone={
					<div className="flex flex-col items-center gap-4">
						<p className="text-4xl font-black text-primary text-shadow-glow">Celebration is here!</p>
						<Button asChild size="lg">
							<Link href="/schedule">Open the schedule</Link>
						</Button>
					</div>
				}
			/>
		</div>
	)
}
