import { connection } from 'next/server'

import { celebration } from '@/lib/celebration'
import { ogSize, renderCountdownImage } from '@/lib/og/countdown-image'

export const alt = `Countdown to ${celebration.shortName}`
export const size = ogSize
export const contentType = 'image/png'

export default async function Image() {
	// The day count changes daily; render per request (CDN-cached for an hour).
	await connection()
	return renderCountdownImage({
		target: celebration.startsAt,
		background: 'bg27.png',
		font: 'noto-black-digits.ttf',
		label: days => String(days),
		fontSize: 325,
		paddingTop: 110,
	})
}
