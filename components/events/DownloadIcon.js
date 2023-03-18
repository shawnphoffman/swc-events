import { memo, useMemo } from 'react'
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { styled } from '@linaria/react'

import ICalendarLink from 'utils/icalendar-link'

export const Button = styled(ICalendarLink)`
	color: var(--download);
	font-size: 26px;
	margin-top: 4px;
	display: block;
	transition: all 0.5s;

	&:hover {
		color: var(--linkHover);
	}
`

const DownloadIcon = ({ event }) => {
	// console.log({ event })
	const icsEvent = useMemo(() => {
		if (!event) return {}
		return {
			title: event.summary,
			description: event.description,
			startTime: event.startAt,
			endTime: event.endAt,
			location: event.address || event.venue,
			url: event.url,
		}
	}, [event])

	if (!event || !ICalendarLink.isSupported) return null

	const icsFilename = `event-${event.id}.ics`

	return (
		<Button filename={icsFilename} event={icsEvent} title="Download Event">
			<FontAwesomeIcon icon={icon({ name: 'calendar-arrow-down', family: 'sharp', style: 'regular' })} />
		</Button>
	)
}

export default memo(DownloadIcon)
