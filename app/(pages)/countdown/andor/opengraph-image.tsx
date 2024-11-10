import { ImageResponse } from 'next/og'

// CELEBRATION START TIME
const celebrationStartTime = new Date('2025-04-22T18:00:00+09:00').getTime()
const daySeconds = 86400

export const runtime = 'edge'

// Image metadata
export const alt = 'Andor Countdown'
export const size = {
	width: 1200,
	height: 630,
}

export const revalidate = 3600
export const dynamic = 'force-dynamic'
export const contentType = 'image/png'

// Image generation
export default async function OgImage() {
	// Make sure the font exists in the specified path:
	const fontData = fetch(new URL('../../../api/og/Noto-opt.otf', import.meta.url)).then(res => res.arrayBuffer())

	const stratTime = Date.now() / 1000
	const endTime = celebrationStartTime / 1000

	const remainingTime = endTime - stratTime
	const days = `${Math.floor(remainingTime / daySeconds) | 0} days`

	return new ImageResponse(
		(
			<div
				style={{
					height: '100%',
					width: '100%',
					display: 'flex',
					textAlign: 'center',
					alignItems: 'center',
					justifyContent: 'center',
					flexDirection: 'column',
					flexWrap: 'nowrap',
					backgroundColor: 'black',
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						height: '100%',
					}}
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img alt="" src={'https://swc.events/andor_bg.png'} width={1200} height={630} />
					{/* eslint-disable-next-line @next/next/no-img-element */}
					{/* <img alt="" src={'http://localhost:3000/andor_bg.png'} width={1200} height={630} /> */}
				</div>
				<div
					style={{
						position: 'absolute',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						fontSize: 220,
						color: 'white',
						fontFamily: '"NotoBlack"',
						lineHeight: 1.5,
						// paddingBottom: 80,
						paddingTop: 220,
					}}
				>
					{/* 366 */}
					{days}
				</div>
			</div>
		),
		{
			width: 1200,
			height: 630,
			fonts: [
				{
					name: 'NotoBlack',
					data: await fontData,
					style: 'normal',
				},
			],
		}
	)
}
