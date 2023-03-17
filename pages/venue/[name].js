/* eslint-disable react/no-unescaped-entities */
import { memo, useMemo } from 'react'
import { useRouter } from 'next/router'
import { styled } from 'linaria/react'

import EventListItem from 'components/events/EventListItem'
import Loading from 'components/Loading'
import { PageTitle } from 'components/styles'
import { useEventContext } from 'context/EventContext'

const Container = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
	overflow-x: hidden;
	background: var(--bg);
	border-radius: 8px;
	flex-direction: column;
	align-items: center;
`
const ScrollBox = styled.div`
	width: 100%;
	overflow-y: scroll;
	::-webkit-scrollbar-corner {
		background: var(--transparent);
	}
`

const VenueDetails = () => {
	const [state] = useEventContext()
	const router = useRouter()

	// console.log('rrrr', router.query)

	const { name } = router.query

	const isLoading = useMemo(() => {
		return !state || !state.allEvents || state.allEvents === []
	}, [state])

	const events = useMemo(() => {
		if (isLoading || !name) return null
		const lowerVenue = name.toLowerCase()
		return state.allEvents.filter(e => e.venue.trim().toLowerCase() === lowerVenue)
	}, [name, isLoading, state.allEvents])

	const hasEvents = useMemo(() => {
		return events && events.length > 0
	}, [events])

	return (
		<Container>
			<PageTitle>Events in "{name}"</PageTitle>
			<ScrollBox>
				{isLoading ? <Loading /> : hasEvents ? events.map(e => <EventListItem event={e} key={e.id} forceOpen />) : <Loading />}
			</ScrollBox>
		</Container>
	)
}

export default memo(VenueDetails)
