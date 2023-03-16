import { memo, useCallback, useMemo } from 'react'
import { styled } from '@linaria/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro'

import { useFavoriteVendorsContext } from 'context/FavoriteVendorsContext'

const IconButton = styled.div`
	color: var(--linkActive);
	font-size: 26px;
	cursor: pointer;

	&:hover {
		color: var(--linkHover);
	}
`

const FavoriteVendorIcon = ({ vendor }) => {
	const { toggleFavorite, favorites } = useFavoriteVendorsContext()

	const handleAdd = useCallback(
		e => {
			e.stopPropagation()
			toggleFavorite(vendor.id, true)
		},
		[toggleFavorite, vendor]
	)

	const handleRemove = useCallback(
		e => {
			e.stopPropagation()
			toggleFavorite(vendor.id, false)
		},
		[vendor, toggleFavorite]
	)

	const isFavorite = useMemo(() => {
		// console.log({ favorites, id: vendor.id })
		return favorites.includes(vendor.id)
	}, [vendor.id, favorites])

	if (isFavorite) {
		return (
			<IconButton key={`${vendor.id}.bookmark-solid`} onClick={handleRemove} title="Remove Bookmark">
				<FontAwesomeIcon icon={icon({ name: 'bookmark', family: 'sharp', style: 'solid' })} />
			</IconButton>
		)
	}

	return (
		<IconButton key={`${vendor.id}-bookmark`} onClick={handleAdd} title="Add Bookmark">
			<FontAwesomeIcon icon={icon({ name: 'bookmark', family: 'sharp', style: 'regular' })} />
		</IconButton>
	)
}

export default memo(FavoriteVendorIcon)
