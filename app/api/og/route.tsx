import { connection } from 'next/server'

import { celebration } from '@/lib/celebration'
import { renderCountdownImage } from '@/lib/og/countdown-image'

/** Legacy share-image URL kept for links already posted on social media. */
export async function GET() {
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
