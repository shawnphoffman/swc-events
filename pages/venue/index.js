import { memo } from 'react'
import { styled } from 'linaria/react'

import Loading from 'components/Loading'
import { PageTitle, ScrollBox } from 'components/styles'
import { useEventContext } from 'context/EventContext'

const Desc = styled.div`
	margin-bottom: 16px;
`

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

const StyledLink = styled.a`
	color: var(--inputBg);
	background: var(--linkActive);
	border: 2px solid var(--inputBorder);
	font-weight: 700;
	border-radius: 8px;
	text-align: center;
	display: inline-block;

	&:hover {
		color: var(--inputBg);
		background: var(--linkHover);
	}
	text-decoration: none;
	cursor: pointer;

	margin: 4px;
	font-size: 16px;
	padding: 8px 8px;
	min-width: 175px;

	&:disabled {
		background: var(--disabled);
	}
`

const CleanScroll = styled(ScrollBox)`
	display: flex;
	flex-direction: column;
	max-width: 400px;
`

const VenueDetails = () => {
	const [state] = useEventContext()

	return (
		<Container>
			<PageTitle>Venues</PageTitle>
			<Desc>Click any link below to see the full schedule for that venue.</Desc>
			<CleanScroll>
				{!state?.allVenues ? (
					<Loading />
				) : (
					<>
						{state.allVenues.sort().map(v => (
							<StyledLink href={`/venue/${v.trim()}`} key={v}>
								{v.trim()}
							</StyledLink>
						))}
					</>
				)}
			</CleanScroll>
		</Container>
	)
}

export default memo(VenueDetails)
