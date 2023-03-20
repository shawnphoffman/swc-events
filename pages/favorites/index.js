import { memo, useMemo } from 'react'
import { styled } from 'linaria/react'
import Link from 'next/link'

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
	const { isAuthed } = useAuth()

	const hasFavorites = useMemo(() => {
		return !!ids.length
	}, [ids])

	const showLoginPrompt = useMemo(() => {
		return !isAuthed
	}, [isAuthed])

	// ============================================================

	const favorites = useMemo(() => {
		if (!state?.allEvents) return []

		const savedFavorites = state.allEvents.filter(e => {
			return ids.includes(e.id)
		})

		return savedFavorites.sort((a, b) => {
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
	}, [ids, state.allEvents])

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
						, we&apos;ll save your favorites across your devices!
					</LoginPrompt>
				</>
			)}
			<ScrollBox>
				{!hasFavorites && <NoFavorites>No favorites to display...</NoFavorites>}
				{hasFavorites && <Divider />}
				{favorites.map(event => (
					<EventListItem event={event} key={event.id} forceOpen />
				))}
			</ScrollBox>
		</Container>
	)
}

export default memo(Favorites)
