import { ExternalLinkIcon } from 'lucide-react'
import type { Metadata } from 'next'

import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { celebration } from '@/lib/celebration'

export const metadata: Metadata = {
	title: 'About',
	description: `About the unofficial ${celebration.shortName} companion.`,
}

const faqs = [
	{
		q: 'Is this the official app?',
		a: `No. This is a fan-made companion. The schedule comes from the official ${celebration.name} listings and refreshes every few minutes, but the official site and app are the source of truth for last-minute changes.`,
	},
	{
		q: 'Do I need an account?',
		a: 'No. Saved events and vendor bookmarks are stored on this device. Use Share on My Schedule to move them to another device or send them to a friend.',
	},
	{
		q: 'What time zone are times in?',
		a: `All times are local to the show (${celebration.city}), even if your phone is set to a different zone, so they match the signs in the building.`,
	},
	{
		q: 'How does calendar subscribe work?',
		a: 'Subscribing adds your saved events as a live calendar. If a panel moves rooms or times, your calendar app picks up the change on its next refresh. Events you save later need a new subscription link.',
	},
	{
		q: 'What do you collect?',
		a: 'Anonymous, cookie-free page analytics from Vercel. Your saved events never leave your device unless you share them.',
	},
]

export default function AboutPage() {
	return (
		<div className="flex flex-col gap-6">
			<PageHeader title="About" description={celebration.appName} />
			<div className="grid gap-3">
				{faqs.map(({ q, a }) => (
					<Card key={q}>
						<CardHeader>
							<CardTitle>{q}</CardTitle>
						</CardHeader>
						<CardContent className="text-muted-foreground">{a}</CardContent>
					</Card>
				))}
			</div>
			<p className="text-sm text-muted-foreground">
				Questions or an event to add? Reach out to{' '}
				<a href="https://twitter.com/iceplanethoff" target="_blank" rel="noreferrer" className="text-foreground underline underline-offset-2">
					@iceplanethoff
				</a>
				. Official show info lives at{' '}
				<a href={celebration.officialSite} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-foreground underline underline-offset-2">
					starwarscelebration.com
					<ExternalLinkIcon className="size-3" aria-hidden />
				</a>
				. Star Wars is a trademark of Lucasfilm Ltd. This site is not affiliated with Lucasfilm, Disney, or ReedPop.
			</p>
		</div>
	)
}
