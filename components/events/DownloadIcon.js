import { memo, useMemo } from 'react'
import ICalendarLink from 'utils/icalendar-link'
import { styled } from '@linaria/react'

export const Button = styled(ICalendarLink)`
	color: var(--download);
	font-size: 26px;
	margin-top: 4px;
	display: block;

	&:hover {
		color: var(--linkHover);
	}
`

const DownloadIcon = ({ event }) => {
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
			<i className="fa-light fa-calendar-arrow-down"></i>
		</Button>
	)
}

export default memo(DownloadIcon)
