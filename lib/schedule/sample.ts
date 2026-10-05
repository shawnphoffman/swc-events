import { celebration } from '@/lib/celebration'

import type { RawScheduleItem, RawVendor } from './normalize'

/**
 * Deterministic sample data in the *upstream* feed shape, so the full
 * fetch -> normalize -> render path runs before the real 2027 feed is published.
 * Never shown in production unless SCHEDULE_SOURCE=sample.
 */

const stages = [
	'Celebration Stage',
	'Galaxy Stage',
	'Twin Suns Stage',
	'Fan Stage',
	'Collectors Stage',
	'University Stage',
	'Kids Stage',
	'Celebration LIVE! Stage',
	'Star Wars Holonet News Stage (Room 403)',
	'STEAM Academy Classroom (Room 411)',
]

const topics = [
	'Lucasfilm Publishing',
	'The Mandalorian & Grogu',
	'Hasbro Star Wars',
	'LEGO Star Wars',
	'Andor: A Retrospective',
	'Costuming 101',
	'Droid Builders Showcase',
	'Star Wars: 50 Years of A New Hope',
	'Creature Shop Secrets',
	'Lucasfilm Games',
	'Collecting Vintage Kenner',
	'The Art of Ralph McQuarrie',
	'Ahsoka Season 2',
	'Writing for a Galaxy Far, Far Away',
	'Star Wars Comics Spotlight',
	'Podcast Meetup',
	'Fan Film Awards',
	'Cosplay Masquerade',
	'Behind the Score',
	'Star Wars Outlaws Developers',
]

const pad = (n: number) => String(n).padStart(2, '0')

function mulberry32(seed: number) {
	return () => {
		seed |= 0
		seed = (seed + 0x6d2b79f5) | 0
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

export function sampleScheduleItems(): RawScheduleItem[] {
	const rand = mulberry32(2027)
	const items: RawScheduleItem[] = []
	const [y, m, d] = celebration.firstDay.split('-').map(Number) as [number, number, number]
	let id = 270000

	for (let dayOffset = 0; dayOffset < 4; dayOffset++) {
		const date = `${y}-${pad(m)}-${pad(d + dayOffset)}`
		const closing = dayOffset === 3 ? 17 : 19
		for (const stage of stages) {
			let minutes = 10 * 60 + (rand() < 0.5 ? 0 : 30)
			while (minutes < closing * 60 - 30) {
				const length = [30, 45, 60, 60, 90][Math.floor(rand() * 5)]!
				const topic = topics[Math.floor(rand() * topics.length)]!
				const startH = Math.floor(minutes / 60)
				const startM = minutes % 60
				const end = Math.min(minutes + length, closing * 60)
				items.push({
					id: id++,
					title: `${topic}${rand() < 0.2 ? ' &amp; Friends' : ''}`,
					description: `Sample panel for layout testing.<br>Join us at the ${stage} for ${topic}.\n\nThis is placeholder content until the official ${celebration.year} schedule is published.`,
					location: stage,
					start_time: `${date} ${pad(startH)}:${pad(startM)}:00`,
					end_time: `${date} ${pad(Math.floor(end / 60))}:${pad(end % 60)}:00`,
				})
				minutes = end + [0, 15, 30][Math.floor(rand() * 3)]!
			}
		}
	}
	return items
}

export function sampleVendors(): RawVendor[] {
	const rand = mulberry32(42)
	const names = [
		'Hasbro Pulse',
		'Her Universe',
		'Hot Toys',
		'LEGO',
		'Sideshow',
		'Funko',
		'Lucasfilm Publishing',
		'Galactic Pin Exchange',
		'Mos Eisley Merch Co.',
		'Kessel Run Comics',
		'Outer Rim Apparel',
		'Holocron Collectibles',
	]
	return names.map((company, i) => ({
		id: 9000 + i,
		company,
		description: `Sample vendor listing for ${company}.`,
		booth: `${1000 + Math.floor(rand() * 900)}`,
		store_url: 'www.starwarscelebration.com',
		featured: i < 3,
		specials:
			rand() < 0.5
				? [{ id: 1, title: `${celebration.year} Celebration Exclusive`, price: `$${Math.floor(rand() * 80) + 20}`, link: null }]
				: null,
	}))
}
