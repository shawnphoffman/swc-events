import '@/app/stars.css'

/** Fixed, decorative starfield behind all content. Page scrolling stays native. */
export function Starfield() {
	return (
		<div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" data-print="hide">
			<div className="absolute inset-0 bg-linear-to-b from-[oklch(0.12_0.02_265)] via-[oklch(0.13_0.015_265)] to-[oklch(0.3_0.07_75)]" />
			<div id="stars" className="absolute" />
			<div id="stars2" className="absolute" />
			<div id="stars3" className="absolute" />
		</div>
	)
}
