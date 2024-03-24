'use client'

// https://github.com/karolkozer/planby?tab=readme-ov-file
import React from 'react'
import { Epg, Layout, useEpg } from 'planby'

function getDateString(date: Date) {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0') // Months are zero-based
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}/${month}/${day}`
}

const generateEpg = (channels: string[]) => {
	const epg = []
	for (const channel of channels) {
		const sinceDate = new Date()
		sinceDate.setHours(0, 0, 0, 0)
		const tillDate = new Date(sinceDate)
		tillDate.setHours(tillDate.getHours() + 1)

		const epgChannel = {
			channelUuid: channel,
			description: 'Ut anim nisi consequat minim deserunt...',
			id: `${channel}-a1`,
			image: 'https://placehold.co/25x25',
			since: sinceDate.toISOString(),
			till: tillDate.toISOString(),
			title: 'Title',
		}
		epg.push(epgChannel)
	}
	return epg
}

export default function Schedule() {
	const channels = React.useMemo(
		() => [
			{
				logo: 'https://placehold.co/60x60',
				uuid: '1',
			},
			{
				logo: 'https://placehold.co/60x60',
				uuid: '2',
			},
			{
				logo: 'https://placehold.co/60x60',
				uuid: '4',
			},
			{
				logo: 'https://placehold.co/60x60',
				uuid: '5',
			},
		],
		[]
	)

	const epg = React.useMemo(() => generateEpg(channels.map(channel => channel.uuid)), [channels])

	const { getEpgProps, getLayoutProps, onScrollToNow, onScrollLeft, onScrollRight } = useEpg({
		epg,
		channels,
		// startDate: '2024/03/23',
		startDate: getDateString(new Date()),
	})

	return (
		<div>
			<div style={{ height: '90dvh', width: '90dvw' }}>
				<Epg {...getEpgProps()}>
					<Layout {...getLayoutProps()} />
				</Epg>
			</div>
		</div>
	)
}
