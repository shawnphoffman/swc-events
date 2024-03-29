import { memo, Suspense } from 'react'
import { styled } from 'linaria/react'

import Loading from 'components/Loading'
import { useEventContext } from 'context/EventContext'

import EventListItem from './EventListItem'

const Container = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
	overflow-x: hidden;
	background: var(--outline);
	border-radius: 8px;
`
const ScrollBox = styled.div`
	width: 100%;
	overflow-y: scroll;
	::-webkit-scrollbar-corner {
		background: var(--transparent);
	}
`

const Agenda = () => {
	const [state, _, loading] = useEventContext()

	if (!state?.allEvents || !state?.coreEvents || loading) {
		return <Loading />
	}

	return (
		<Container>
			<ScrollBox>
				<Suspense fallback={<Loading />}>
					{state.allEvents.map(e => {
						if (state.disabledVenues.includes(e.venue)) return null
						return <EventListItem key={e.id} event={e} />
					})}
				</Suspense>
			</ScrollBox>
		</Container>
	)
}

export default memo(Agenda)
