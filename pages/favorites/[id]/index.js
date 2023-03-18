import { memo, useEffect, useMemo, useState } from 'react'
import { styled } from 'linaria/react'
import { useRouter } from 'next/router'

import EventListItem from 'components/events/EventListItem'
import Loading from 'components/Loading'
import { Container, PageTitle, ScrollBox } from 'components/styles'
import { useEventContext } from 'context/EventContext'
import { useAuth } from 'hooks/useAuth'

const NoFavorites = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 0;
	margin-top: 16px;
	font-weight: bold;
`

const Page = () => {
	const { client } = useAuth()
	const router = useRouter()
	const { id } = router.query
	const [tempFaves, setTempFaves] = useState([])
	const [loading, setLoading] = useState(true)
	const [state] = useEventContext()

	useEffect(() => {
		const fetchFaves = async () => {
			try {
				setLoading(true)

				let { data, status, error } = await client.from('favorites').select().eq('user_id', id)

				// console.log('fetchFaves', {
				// 	data,
				// 	status,
				// 	error,
				// })

				if (error && status !== 406) {
					throw error
				}

				if (data) {
					setTempFaves(data)
				}
			} catch (error) {
				// console.log('load', error)
				// alert(error.message)
			} finally {
				setLoading(false)
			}
		}
		fetchFaves()
	}, [client, id])

	const tempFaveIds = useMemo(() => {
		return tempFaves?.map(f => f.event_id)
	}, [tempFaves])

	const favorites = useMemo(() => {
		if (!state?.allEvents) return []

		const savedFavorites = state.allEvents.filter(e => {
			return tempFaveIds.includes(e.id)
		})

		// const savedCustomEvents = customEvents.filter(e => {
		// 	return sharedFaveIds.includes(e.id)
		// })

		// const rawFavorites = [...savedFavorites, ...savedCustomEvents]
		const rawFavorites = [...savedFavorites]

		return rawFavorites.sort((a, b) => {
			const aStart = new Date(a.startDate)
			const bStart = new Date(b.startDate)
			const aEnd = new Date(a.endDate)
			const bEnd = new Date(b.endDate)
			if (aStart > bStart) return 1
			if (aStart < bStart) return -1
			if (aEnd > bEnd) return 1
			if (aEnd < bEnd) return -1
			if (a.summary > b.summary) return 1
			if (a.summary < b.summary) return -1
			return 0
		})
	}, [state.allEvents, tempFaveIds])

	if (loading) {
		return <Loading />
	}

	return (
		<Container>
			<PageTitle>Shared Favorites</PageTitle>

			<ScrollBox>
				{!tempFaves?.length && <NoFavorites>No favorites to display...</NoFavorites>}
				{favorites.map(event => (
					<EventListItem event={event} key={event.id} forceOpen />
				))}
				{/* {tempFaves?.length ? <pre>{JSON.stringify(tempFaves, null, 2)}</pre> : <div>No favorites found...</div>} */}
			</ScrollBox>
		</Container>
	)
}

export default memo(Page)
