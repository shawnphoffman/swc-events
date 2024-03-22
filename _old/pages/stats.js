import { memo, useEffect, useMemo, useState } from 'react'
import { styled } from 'linaria/react'

import Loading from 'components/Loading'
import { Container, PageTitle, ScrollBox } from 'components/styles'
import { useEventContext } from 'context/EventContext'
import { useAuth } from 'hooks/useAuth'

const StyledLink = styled.a`
	color: var(--linkAlt);
	// font-size: 12px;
	// font-weight: bold;
	line-height: 1.2;

	&:hover {
		color: var(--linkHover);
	}
`

const Desc = styled.div`
	margin-bottom: 16px;
`

const FlexBoi = styled.div`
	display: flex;
	justify-content: center;
	margin-top: 16px;
`

const FakeTable = styled.div`
	display: flex;
	flex-direction: column;
	max-width: 620px;
`

const Row = styled.div`
	display: flex;
	flex-direction: row;
	border-bottom: 1px solid var(--inactive);
	padding: 8px;
	align-items: center;
`

const Header = styled(Row)`
	font-weight: bold;
`

const Cell = styled.div`
	display: flex;
	flex: 1;
`

const TotalCell = styled(Cell)`
	flex: 0 0 85px;
	justify-content: center;
	text-align: center;
`

const VenueDetails = () => {
	const [state] = useEventContext()
	const [stats, setStats] = useState([])
	const { client } = useAuth()

	const statEvents = useMemo(() => {
		if (!stats?.length || !state?.allEvents) {
			return []
		}

		return state.allEvents
			.reduce((memo, e) => {
				const f = stats.find(s => {
					return s.event_id === e.id
				})
				if (f) {
					memo.push({
						id: e.id,
						summary: e.summary,
						total: f.total,
					})
				}
				return memo
			}, [])
			.sort((a, b) => {
				if (a.total < b.total) return 1
				if (a.total > b.total) return -1
				if (a.summary > b.summary) return 1
				if (a.summary < b.summary) return -1
				return 0
			})
	}, [stats, state])

	useEffect(() => {
		const fetchStats = async () => {
			let { data } = await client.from('rollup_favorites').select()

			if (data) {
				setStats(data)
			}
		}

		fetchStats()
	}, [client])

	return (
		<Container>
			<PageTitle>Stats</PageTitle>
			<Desc>Do you ever wonder what is popular?</Desc>
			<ScrollBox>
				{!state?.allVenues || !stats?.length ? (
					<Loading />
				) : (
					<FlexBoi>
						<FakeTable>
							<Header>
								<Cell>Event</Cell>
								<TotalCell>Total Favorites</TotalCell>
							</Header>
							{statEvents.map(s => (
								<Row key={s.id}>
									<Cell>
										<StyledLink href={`/event/${s.id}`}>{s.summary}</StyledLink>
									</Cell>
									<TotalCell>{s.total}</TotalCell>
								</Row>
							))}
						</FakeTable>
					</FlexBoi>
				)}
			</ScrollBox>
		</Container>
	)
}

export default memo(VenueDetails)
