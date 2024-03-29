import React, { memo, useCallback, useMemo, useState } from 'react'
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { styled } from 'linaria/react'

import DeleteEventIcon from 'components/auth/DeleteEventIcon'
import EditEventIcon from 'components/auth/EditEventIcon'
import { useAuth } from 'hooks/useAuth'
import { dayColor, dayName, formatTime } from 'utils/dataUtils'

import DownloadIcon from './DownloadIcon'
import EventLinkIcon from './EventLinkIcon'
import FavoriteIcon from './FavoriteIcon'

const PrivacyIcon = styled.div`
	font-size: 20px;
	margin-top: 4px;
	color: ${p => (p.private ? 'var(--private)' : 'var(--public)')};
`

const EventImage = styled.img`
	max-width: 120px;
	max-height: 120px;
`

const Container = styled.div`
	display: flex;
	flex-direction: row;
	border-bottom: 2px solid var(--bg);
	cursor: pointer;
`
const ImageWrapper = styled.div`
	background: var(--outline);
	align-items: center;
	display: flex;

	${Container}:hover & {
		background: var(--outlineHover);
	}
`
const Event = styled.div`
	padding: 16px;
	flex: 1;
	background: var(--outline);
	color: var(--text);

	${Container}:hover & {
		background: var(--outlineHover);
	}
`
const DayName = styled.div`
	background-color: ${p => p.bg};
	color: var(--text);
	writing-mode: vertical-lr;
	display: flex;
	justify-content: center;
	transform: rotate(180deg);
	padding: 8px;
	font-size: 12px;
	font-weight: bold;
	flex: 0;
`
const Title = styled.div`
	font-weight: bold;
	font-size: 16px;
`
const ColorBlock = styled.div`
	width: 6px;
	background-color: ${e => e.color ?? `var(--fallback)`};
	background-image: ${e =>
		e.userEvent
			? e.private
				? `linear-gradient(135deg, var(--private) 25%, var(--inactive) 25%, var(--inactive) 50%, var(--private) 50%, var(--private) 75%, var(--inactive) 75%, var(--inactive) 100%)`
				: `linear-gradient(135deg, var(--public) 25%, var(--green) 25%, var(--green) 50%, var(--public) 50%, var(--public) 75%, var(--green) 75%, var(--green) 100%)`
			: 'none'};
	background-size: ${e => (e.userEvent ? `28.28px 28.28px` : 'auto')};
`
const Description = styled.div`
	font-size: 12px;
	margin: 8px 0;
	white-space: pre-line;
`
const Details = styled.div`
	font-style: italic;
	font-size: 14px;
	margin-top: 8px;
	opacity: 0.9;

	display: flex;
	flex-wrap: wrap;
`
const EventLink = styled.a`
	color: var(--linkAlt);
	font-size: 12px;
	font-weight: bold;

	&:hover {
		color: var(--linkHover);
	}
`
const NoWrap = styled.span`
	margin-right: 8px;
	white-space: nowrap;
`
const ActionWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	background: var(--outline);
	padding: 8px;
	/* Accommodate scroll bars */
	padding-right: 12px;

	${Container}:hover & {
		background: var(--outlineHover);
	}
`

const EventListItem = ({ event, forceOpen = false, onEdit }) => {
	const [expanded, setExpanded] = useState(forceOpen)
	const { user } = useAuth()

	const handleClick = useCallback(() => {
		if (!forceOpen) {
			setExpanded(prev => !prev)
		}
	}, [forceOpen])

	const eventDay = useMemo(() => {
		return dayName[new Date(event.startAt).getDay()]
	}, [event.startAt])

	const isPublicUserEvent = useMemo(() => {
		return event?.type === 'userEvent' && !event?.private
	}, [event])

	const isPrivateUserEvent = useMemo(() => {
		return event?.type === 'userEvent' && event?.private
	}, [event])

	const isMyUserEvent = useMemo(() => {
		// console.log({ user, event })
		return user && event?.type === 'userEvent' && event?.creator_id === user?.id
	}, [event, user])

	const time = useMemo(
		() => ({
			start: formatTime(event.startAt),
			end: formatTime(event.endAt),
		}),
		[event.endAt, event.startAt]
	)

	return (
		<Container onClick={handleClick}>
			<DayName bg={dayColor[eventDay]}>
				{eventDay} - {new Date(event.startAt).getDate()}
			</DayName>
			<ColorBlock color={event.color} userEvent={event.type === 'userEvent'} private={event.private} />
			<Event>
				<Title>{event.summary}</Title>
				<Details>
					<NoWrap>{time.start === time.end ? time.start : `${time.start} - ${time.end}`}</NoWrap>
					<NoWrap>({event.venue.trim()})</NoWrap>
				</Details>
				{expanded && (
					<>
						<Description>{event.description}</Description>
						{event.url && (
							<EventLink href={event.url} target="_blank" rel="noreferrer">
								View details on the official site{' '}
								<FontAwesomeIcon icon={icon({ name: 'up-right-from-square', family: 'sharp', style: 'solid' })} />
							</EventLink>
						)}
					</>
				)}
			</Event>
			{expanded && event.imageUrl && (
				<ImageWrapper>
					<EventImage alt="" src={event.imageUrl} />
				</ImageWrapper>
			)}
			<ActionWrapper>
				{/* Favorite */}
				{!isPrivateUserEvent && <FavoriteIcon event={event} />}
				{expanded && (
					<>
						{/* Download */}
						<DownloadIcon event={event} />
						{/* Open URL */}
						{!isPrivateUserEvent && !isPublicUserEvent && <EventLinkIcon event={event} />}
						{/* Delete */}
						{isMyUserEvent && onEdit && <DeleteEventIcon event={event} />}
						{/* Edit */}
						{isMyUserEvent && onEdit && <EditEventIcon event={event} onEdit={onEdit} />}
						{isMyUserEvent && (
							<PrivacyIcon private={event.private}>
								{event.private ? (
									<FontAwesomeIcon icon={icon({ name: 'eye-slash', family: 'sharp', style: 'solid' })} title="Private Event" />
								) : (
									<FontAwesomeIcon icon={icon({ name: 'eye', family: 'sharp', style: 'solid' })} title="Public Event" />
								)}
							</PrivacyIcon>
						)}
					</>
				)}
			</ActionWrapper>
		</Container>
	)
}

export default memo(EventListItem)
