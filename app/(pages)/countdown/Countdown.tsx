'use client'

import { CountdownCircleTimer } from 'react-countdown-circle-timer'

// CELEBRATION START TIME
const celebrationStartTime = new Date('2027-04-01T10:00:00-07:00').getTime()

const minuteSeconds = 60
const hourSeconds = 3600
const daySeconds = 86400

const timerProps = {
	isPlaying: true,
	size: 250,
	strokeWidth: 26,
}

const renderTime = (dimension: string, time: number) => {
	return (
		<div className="text-3xl time-wrapper text-shadow">
			<div className="text-7xl time">{time}</div>
			<div>{dimension}</div>
		</div>
	)
}

const getTimeSeconds = (time: number) => (minuteSeconds - time) | 0
const getTimeMinutes = (time: number) => ((time % hourSeconds) / minuteSeconds) | 0
const getTimeHours = (time: number) => ((time % daySeconds) / hourSeconds) | 0
const getTimeDays = (time: number) => (time / daySeconds) | 0

export default function Countdown() {
	const stratTime = Date.now() / 1000
	const endTime = celebrationStartTime / 1000

	const remainingTime = endTime - stratTime
	const days = Math.ceil(remainingTime / daySeconds)
	const daysDuration = days * daySeconds

	return (
		<div className="flex flex-row flex-wrap items-center justify-center gap-x-6 gap-y-4">
			{/* DAYS */}
			<CountdownCircle
				duration={daysDuration}
				initialRemainingTime={remainingTime}
				updateInterval={60}
				shouldRepeat={(totalElapsedTime: number) => remainingTime - totalElapsedTime > daySeconds}
				renderText={(elapsedTime: number) => renderTime('days', getTimeDays(daysDuration - elapsedTime))}
			/>

			{/* HOURS */}
			<CountdownCircle
				duration={daySeconds}
				initialRemainingTime={remainingTime % daySeconds}
				updateInterval={30}
				shouldRepeat={(totalElapsedTime: number) => remainingTime - totalElapsedTime > hourSeconds}
				renderText={(elapsedTime: number) => renderTime('hours', getTimeHours(daySeconds - elapsedTime))}
			/>

			{/* MINUTES */}

			<div className="hidden md:block">
				<CountdownCircle
					duration={hourSeconds}
					initialRemainingTime={remainingTime % hourSeconds}
					updateInterval={10}
					shouldRepeat={(totalElapsedTime: number) => remainingTime - totalElapsedTime > minuteSeconds}
					renderText={(elapsedTime: number) => renderTime('minutes', getTimeMinutes(hourSeconds - elapsedTime))}
				/>
			</div>

			{/* SECONDS */}
			<div className="hidden lg:block">
				<CountdownCircle
					duration={minuteSeconds}
					initialRemainingTime={remainingTime % minuteSeconds}
					updateInterval={0}
					shouldRepeat={(totalElapsedTime: number) => remainingTime - totalElapsedTime > 0}
					renderText={(elapsedTime: number) => renderTime('seconds', getTimeSeconds(elapsedTime))}
				/>
			</div>
		</div>
	)
}

type CountdownCircleProps = {
	duration: number
	initialRemainingTime: number
	updateInterval: number
	shouldRepeat: (totalElapsedTime: number) => any
	renderText: (elapsedTime: number) => any
}

function CountdownCircle({ duration, initialRemainingTime, updateInterval, shouldRepeat, renderText }: CountdownCircleProps) {
	return (
		<CountdownCircleTimer
			{...timerProps}
			// colors={['#7e22ce', '#9333ea', '#a855f7', '#c084fc', '#d8b4fe']}
			colors={['#9f7421', '#c28d28', '#d7a23d', '#deb360', '#e6c484']}
			colorsTime={[duration, duration * 0.75, duration * 0.5, duration * 0.25, 0]}
			trailColor="#f3e8ff"
			duration={duration}
			initialRemainingTime={initialRemainingTime}
			updateInterval={updateInterval}
			onComplete={totalElapsedTime => ({
				shouldRepeat: shouldRepeat(totalElapsedTime),
			})}
		>
			{({ elapsedTime, color }) => <span style={{ color }}>{renderText(elapsedTime)}</span>}
		</CountdownCircleTimer>
	)
}
