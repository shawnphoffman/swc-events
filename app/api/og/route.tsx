import { ImageResponse } from 'next/og'

// CELEBRATION START TIME
// const celebrationStartTime = new Date('2025-04-18T10:00:00+09:00').getTime()
const celebrationStartTime = new Date('2027-04-01T10:00:00-07:00').getTime()
const daySeconds = 86400

export const runtime = 'edge'
export const revalidate = 3600
export const dynamic = 'force-dynamic'

export async function GET() {
	// Make sure the font exists in the specified path:
	const fontData = await fetch(new URL('./NotoSans-Black-opt.ttf', import.meta.url)).then(res => res.arrayBuffer())

	const stratTime = Date.now() / 1000
	const endTime = celebrationStartTime / 1000

	const remainingTime = endTime - stratTime
	const days = Math.floor(remainingTime / daySeconds) | 0

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
					<img alt="" src={'https://swc.events/bg27.png'} width={1200} height={630} />
					{/* <img alt="" src={'http://localhost:3000/bg.png'} width={1200} height={630} /> */}
				</div>
				<div
					style={{
						position: 'absolute',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						fontSize: 325,
						color: 'white',
						fontFamily: '"NotoBlack"',
						lineHeight: 1.2,
						paddingBottom: 80,
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
					data: fontData,
					style: 'normal',
				},
			],
		}
	)
}
