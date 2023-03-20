import { memo, useCallback, useMemo } from 'react'
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { styled } from 'linaria/react'
import Link from 'next/link'

import Routes from 'config/routes'
import { EventAction, useEventContext } from 'context/EventContext'
import { useAuth } from 'hooks/useAuth'
import { cleanVenueName, colorMap } from 'utils/dataUtils'

const PrintLink = styled.div`
	text-decoration: none;
	color: var(--text);

	@media (max-width: 600px) {
		display: none;
	}
`

const Wrapper = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	flex-wrap: wrap;
	margin-bottom: 4px;
	max-width: 1200px;
	flex: 0;
	margin-right: -6px;
	margin-left: -6px;
`

const VenueWrapper = styled.div`
	padding: 4px 8px;
	font-size: 12px;
	white-space: nowrap;
	margin: 2px;
	border-radius: 4px;
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	align-items: center;
	cursor: pointer;
	background: var(--outline);

	&:hover {
		text-decoration: ${props => (props.enabled ? 'underline' : 'none')};
	}
`

const VenueName = styled.span`
	text-decoration: ${props => (props.enabled ? 'none' : 'line-through')};
`

const Indicator = styled.div`
	font-size: 8px;
	margin-right: 4px;
	filter: none;
	color: ${props => (props.enabled ? colorMap[props.name] ?? 'var(--text)' : 'var(--text)')};

	${VenueWrapper}:hover & {
		color: ${props => colorMap[props.name] ?? 'var(--text)'};
	}
`

const Venue = memo(({ enabled, name }) => {
	const cleanName = useMemo(() => {
		return cleanVenueName(name)
	}, [name])

	return (
		<VenueWrapper enabled={enabled}>
			<Indicator name={cleanName} enabled={enabled} key={`i-${name}-${enabled}`}>
				{enabled ? (
					<FontAwesomeIcon icon={icon({ name: 'square', family: 'sharp', style: 'solid' })} />
				) : (
					<FontAwesomeIcon icon={icon({ name: 'square-dashed', family: 'sharp', style: 'solid' })} />
				)}
			</Indicator>
			<VenueName enabled={enabled}>{cleanName.trim()}</VenueName>
		</VenueWrapper>
	)
})
Venue.displayName = 'Venue'

const Filters = memo(() => {
	const [state, dispatch] = useEventContext()
	const { isAuthed } = useAuth()

	const handleClick = useCallback(name => () => dispatch({ type: EventAction.TOGGLE_VENUE, name }), [dispatch])

	const handleAllOn = useCallback(() => dispatch({ type: EventAction.ALL_VENUES_ON }), [dispatch])
	const handleAllOff = useCallback(() => dispatch({ type: EventAction.ALL_VENUES_OFF }), [dispatch])

	if (!state?.allVenues) return null

	return (
		<Wrapper>
			{state.allVenues.map(v => (
				<div key={v} onClick={handleClick(v)}>
					<Venue enabled={!state.disabledVenues.includes(v)} name={v} />
				</div>
			))}
			<div onClick={handleClick('Public Events')}>
				<VenueWrapper enabled={!state.disabledVenues.includes('Public Events')}>
					<Indicator enabled={!state.disabledVenues.includes('Public Events')}>
						<FontAwesomeIcon icon={icon({ name: 'users', family: 'sharp', style: 'solid' })} />
					</Indicator>
					<VenueName enabled={!state.disabledVenues.includes('Public Events')}>Public Events</VenueName>
				</VenueWrapper>
			</div>
			{isAuthed && (
				<div onClick={handleClick('My Events')}>
					<VenueWrapper enabled={!state.disabledVenues.includes('My Events')}>
						<Indicator enabled={!state.disabledVenues.includes('My Events')}>
							<FontAwesomeIcon icon={icon({ name: 'eye-slash', family: 'sharp', style: 'solid' })} />
						</Indicator>
						<VenueName enabled={!state.disabledVenues.includes('My Events')}>My Private Events</VenueName>
					</VenueWrapper>
				</div>
			)}
			<div onClick={handleAllOn}>
				<VenueWrapper enabled>
					<Indicator enabled>
						<FontAwesomeIcon icon={icon({ name: 'check', family: 'sharp', style: 'solid' })} />
					</Indicator>
					<VenueName enabled>All On</VenueName>
				</VenueWrapper>
			</div>
			<div onClick={handleAllOff}>
				<VenueWrapper enabled>
					<Indicator enabled>
						<FontAwesomeIcon icon={icon({ name: 'close', family: 'sharp', style: 'solid' })} />
					</Indicator>
					<VenueName enabled>All Off</VenueName>
				</VenueWrapper>
			</div>
			<Link href={Routes.PrintSchedule.path}>
				<PrintLink>
					<VenueWrapper enabled>
						<Indicator enabled>
							<FontAwesomeIcon icon={icon({ name: 'print', family: 'sharp', style: 'solid' })} />
						</Indicator>
						<VenueName enabled>Print</VenueName>
					</VenueWrapper>
				</PrintLink>
			</Link>
		</Wrapper>
	)
})
Filters.displayName = 'Filters'

export default Filters
