import { memo, useCallback, useMemo } from 'react'
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { styled } from '@linaria/react'

import { useFavoritesContext } from 'context/FavoritesContext'

const IconButton = styled.div`
	color: var(--heart);
	font-size: 26px;
	cursor: pointer;
	transition: all 0.5s;

	&:hover {
		color: var(--linkHover);
	}
`

const FavoriteIcon = ({ event }) => {
	const { toggleFavorite, favorites } = useFavoritesContext()

	const handleAdd = useCallback(
		e => {
			e.stopPropagation()
			toggleFavorite(event.id, true)
		},
		[toggleFavorite, event]
	)

	const handleRemove = useCallback(
		e => {
			e.stopPropagation()
			toggleFavorite(event.id, false)
		},
		[event, toggleFavorite]
	)

	const isFavorite = useMemo(() => {
		return favorites.includes(event.id)
	}, [event.id, favorites])

	if (isFavorite) {
		return (
			<IconButton key={`${event.id}.heart-solid`} onClick={handleRemove} title="Remove Favorite">
				<FontAwesomeIcon icon={icon({ name: 'heart', family: 'sharp', style: 'solid' })} />
			</IconButton>
		)
	}

	return (
		<IconButton key={`${event.id}-heart`} onClick={handleAdd} title="Add Favorite">
			<FontAwesomeIcon icon={icon({ name: 'heart', family: 'sharp', style: 'regular' })} />
		</IconButton>
	)
}

export default memo(FavoriteIcon)
