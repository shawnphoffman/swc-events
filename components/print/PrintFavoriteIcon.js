import { memo, useMemo } from 'react'
import { styled } from '@linaria/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro'

import { useFavoritesContext } from 'context/FavoritesContext'

const IconButton = styled.div`
	color: var(--heart);
	font-size: 26px;
`

const FavoriteIcon = ({ event }) => {
	const { favorites } = useFavoritesContext()

	const isFavorite = useMemo(() => {
		return favorites.includes(event.id)
	}, [event.id, favorites])

	if (isFavorite) {
		return (
			<IconButton key={`${event.id}.heart-solid`}>
				<FontAwesomeIcon icon={icon({ name: 'heart', family: 'sharp', style: 'solid' })} />
			</IconButton>
		)
	}

	return null
}

export default memo(FavoriteIcon)
