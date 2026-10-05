import 'server-only'

import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const ogSize = { width: 1200, height: 630 }

const DAY_MS = 86_400_000

/** Whole days until `target`, never negative. */
export function daysUntil(target: string, now: number = Date.now()): number {
	return Math.max(0, Math.floor((Date.parse(target) - now) / DAY_MS))
}

type CountdownImageOptions = {
	target: string
	/** File under public/ used as the full-bleed background. */
	background: string
	/** Font file under assets/og/. Subset fonts must contain every glyph in `label`. */
	font: string
	label: (days: number) => string
	fontSize: number
	paddingTop?: number
	paddingBottom?: number
}

/**
 * Renders the "N days" share card. Assets are read from disk (Node runtime)
 * instead of fetched from the production domain, so previews and local dev
 * render the same image as production.
 */
export async function renderCountdownImage({ target, background, font, label, fontSize, paddingTop = 0, paddingBottom = 0 }: CountdownImageOptions) {
	const [fontData, bg] = await Promise.all([
		readFile(join(process.cwd(), 'assets/og', font)),
		readFile(join(process.cwd(), 'public', background)),
	])
	const days = daysUntil(target)

	return new ImageResponse(
		(
			<div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', backgroundColor: 'black' }}>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img alt="" src={`data:image/png;base64,${bg.toString('base64')}`} width={ogSize.width} height={ogSize.height} />
				<div
					style={{
						// Satori has no `inset` shorthand
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize,
						color: 'white',
						fontFamily: 'NotoBlack',
						lineHeight: 1.2,
						paddingTop,
						paddingBottom,
					}}
				>
					{label(days)}
				</div>
			</div>
		),
		{
			...ogSize,
			fonts: [{ name: 'NotoBlack', data: fontData, style: 'normal' }],
			headers: { 'cache-control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' },
		}
	)
}
