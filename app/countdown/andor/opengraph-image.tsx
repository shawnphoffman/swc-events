import { connection } from 'next/server'

import { ogSize, renderCountdownImage } from '@/lib/og/countdown-image'

import { andorPremiere } from './config'

export const alt = 'Andor Countdown'
export const size = ogSize
export const contentType = 'image/png'

export default async function Image() {
	await connection()
	return renderCountdownImage({
		target: andorPremiere,
		background: 'andor_bg.png',
		font: 'noto-black-subset.otf',
		label: days => `${days} days`,
		fontSize: 220,
		paddingTop: 220,
	})
}
