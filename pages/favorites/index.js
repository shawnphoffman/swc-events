/* eslint-disable react/no-unescaped-entities */
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { styled } from 'linaria/react'

import CopyUrlIcon from 'components/events/CopyUrlIcon'
import EventListItem from 'components/events/EventListItem'
import { PageTitle } from 'components/styles'
import Routes from 'config/routes'
import { useEventContext } from 'context/EventContext'
import { useFavoritesContext } from 'context/FavoritesContext'
import { useAuth } from 'hooks/useAuth'

const Divider = styled.hr`
	width: 100%;
	border-color: var(--text);
`
const NoFavorites = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 0;
	margin-top: 16px;
	font-weight: bold;
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
const ScrollBox = styled.div`
	width: 100%;
	overflow-y: scroll;
	::-webkit-scrollbar-corner {
		background: var(--transparent);
	}
`
const LoginPrompt = styled.div`
	margin-bottom: 8px;
`
const NextLink = styled.div`
	color: var(--linkAlt);
	font-weight: bold;
	text-decoration: none;
	display: inline-block;

	&:hover {
		color: var(--linkHover);
	}
`

const Favorites = () => {
	const [state] = useEventContext()
	const { favorites: ids } = useFavoritesContext()
	const { client, user, isAuthed } = useAuth()

	const [userEvents, setUserEvents] = useState([])

	const hasFavorites = useMemo(() => {
		return !!ids.length
	}, [ids])

	const showLoginPrompt = useMemo(() => {
		return !isAuthed
	}, [isAuthed])

	// ============================================================

	// User Events
	const fetchUserEvents = useCallback(async () => {
		if (!isAuthed || !user?.id || !client) {
			return
		}

		try {
			let { data, error } = await client.from('userEvents').select().eq('creator_id', user?.id)

			if (error) {
				console.error(error)
			}

			if (data) {
				const temp = Object.values(data).sort((a, b) => {
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

				setUserEvents(temp)
			}
		} catch (e) {
			console.log(e)
		}
	}, [client, isAuthed, user?.id])

	// ============================================================

	// All Events
	const customEvents = useMemo(() => {
		// 	if (!state || !state.allEvents) return []
		// 	if (customEventsRep?.status !== 'success' || !customEventsRep?.data) {
		return []
		// 	} else {
		// 		return Object.keys(customEventsRep.data).reduce((memo, curr) => {
		// 			memo = [...memo, ...Object.values(customEventsRep.data[curr])]
		// 			return memo
		// 		}, [])
		// 	}
		// }, [customEventsRep.data, customEventsRep?.status, state])
	}, [])
	// ============================================================

	const favorites = useMemo(() => {
		if (!state?.allEvents) return []

		const savedFavorites = state.allEvents.filter(e => {
			return ids.includes(e.id)
		})

		const savedCustomEvents = customEvents.filter(e => {
			return ids.includes(e.id)
		})

		console.log({
			savedFavorites,
			userEvents,
			savedCustomEvents,
		})

		const rawFavorites = [...savedFavorites, ...userEvents, ...savedCustomEvents]

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
	}, [customEvents, ids, state.allEvents, userEvents])

	useEffect(() => {
		fetchUserEvents()
	}, [fetchUserEvents])

	return (
		<Container>
			<PageTitle>
				Your Favorited Events <CopyUrlIcon />
			</PageTitle>
			{showLoginPrompt && (
				<>
					<LoginPrompt>
						If you{' '}
						<NextLink>
							<Link href={Routes.Login.path}>log in</Link>
						</NextLink>
						, we'll save your favorites across your devices!
					</LoginPrompt>
				</>
			)}
			<ScrollBox>
				{!hasFavorites && !userEvents && <NoFavorites>No favorites to display...</NoFavorites>}
				{/* {userEvents && userEvents.map(event => <EventListItem event={event} key={event.id} forceOpen />)} */}
				{hasFavorites && userEvents && <Divider />}
				{favorites.map(event => (
					<EventListItem event={event} key={event.id} forceOpen />
				))}
			</ScrollBox>
		</Container>
	)
}

export default memo(Favorites)
