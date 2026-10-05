'use client'

import type { CSSProperties, ReactNode } from 'react'

import { useNow } from '@/hooks/use-now'
import { cn } from '@/lib/utils'

const MINUTE = 60
const HOUR = 3600
const DAY = 86400

type Unit = { label: string; value: number; fraction: number }

function breakdown(remainingSeconds: number): Unit[] {
	const s = Math.max(0, Math.floor(remainingSeconds))
	const days = Math.floor(s / DAY)
	const hours = Math.floor((s % DAY) / HOUR)
	const minutes = Math.floor((s % HOUR) / MINUTE)
	const seconds = s % MINUTE
	return [
		{ label: days === 1 ? 'day' : 'days', value: days, fraction: Math.min(days / 365, 1) },
		{ label: hours === 1 ? 'hour' : 'hours', value: hours, fraction: hours / 24 },
		{ label: minutes === 1 ? 'minute' : 'minutes', value: minutes, fraction: minutes / 60 },
		{ label: seconds === 1 ? 'second' : 'seconds', value: seconds, fraction: seconds / 60 },
	]
}

const RADIUS = 44
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function Dial({ unit, pending }: { unit: Unit; pending: boolean }) {
	return (
		<div className="relative aspect-square w-full max-w-56">
			<svg viewBox="0 0 100 100" className="size-full -rotate-90 drop-shadow-[0_4px_10px_rgb(0_0_0/0.8)]" aria-hidden>
				<circle cx="50" cy="50" r={RADIUS} fill="rgb(0 0 0 / 0.55)" stroke="var(--countdown-track)" strokeWidth="9" />
				<circle
					cx="50"
					cy="50"
					r={RADIUS}
					fill="none"
					stroke="url(#countdown-gradient)"
					strokeWidth="9"
					strokeLinecap="round"
					strokeDasharray={CIRCUMFERENCE}
					strokeDashoffset={pending ? CIRCUMFERENCE : CIRCUMFERENCE * (1 - unit.fraction)}
					className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center text-shadow-glow">
				<span className="text-5xl font-black tabular-nums sm:text-6xl" style={{ color: 'var(--countdown-text)' }}>
					{pending ? '–' : unit.value}
				</span>
				<span className="text-sm font-semibold tracking-widest text-foreground/80 uppercase sm:text-base">{unit.label}</span>
			</div>
		</div>
	)
}

type CountdownProps = {
	/** ISO timestamp with offset. */
	target: string
	/** Gradient stops for the rings, light to dark. */
	colors?: [string, string]
	trackColor?: string
	textColor?: string
	/** Rendered once the target has passed. */
	whenDone?: ReactNode
	className?: string
}

export function Countdown({
	target,
	colors = ['#f3d79a', '#c28d28'],
	trackColor = 'rgb(255 255 255 / 0.12)',
	textColor = '#f3d79a',
	whenDone,
	className,
}: CountdownProps) {
	const now = useNow(1000)
	const targetMs = Date.parse(target)
	const remaining = now === null ? null : (targetMs - now) / 1000

	if (remaining !== null && remaining <= 0 && whenDone) return <>{whenDone}</>

	const units = breakdown(remaining ?? 0)
	const label =
		remaining === null
			? 'Loading countdown'
			: `${units[0]!.value} days, ${units[1]!.value} hours, ${units[2]!.value} minutes remaining`

	return (
		<div
			role="timer"
			aria-label={label}
			className={cn('grid w-full max-w-5xl grid-cols-2 place-items-center gap-4 sm:gap-6 lg:grid-cols-4', className)}
			style={{ '--countdown-track': trackColor, '--countdown-text': textColor } as CSSProperties}
		>
			<svg width="0" height="0" className="absolute" aria-hidden>
				<defs>
					<linearGradient id="countdown-gradient" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stopColor={colors[0]} />
						<stop offset="100%" stopColor={colors[1]} />
					</linearGradient>
				</defs>
			</svg>
			{units.map(unit => (
				<Dial key={unit.label.replace(/s$/, '')} unit={unit} pending={remaining === null} />
			))}
		</div>
	)
}
