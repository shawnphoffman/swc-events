import { createContext, memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { useAuth } from 'hooks/useAuth'
import useLocalStorage from 'hooks/useLocalStorage'

const favoritesStorageKey = 'SWC.Favorites.2023'

const initialState = {
	favorites: [],
	toggleFavorite: () => {},
}

const FavoritesContext = createContext(initialState)

const FavoritesProvider = ({ children }) => {
	// Non-Auth Storage
	const [favorites, setFavorites] = useLocalStorage(favoritesStorageKey, [])

	// ============================================================

	// Supabase
	const { client, user, isAuthed } = useAuth()
	const [loading, setLoading] = useState(true)
	const [userFavorites, setUserFavorites] = useState([])
	const userFavoriteIds = useMemo(() => {
		return userFavorites?.map(f => f.event_id)
	}, [userFavorites])

	//
	const fetchUserFavorites = useCallback(async () => {
		try {
			setLoading(true)

			let { data, status, error } = await client.from('favorites').select().eq('user_id', user?.id)

			if (error && status !== 406) {
				throw error
			}

			if (data) {
				setUserFavorites(data)
			}
		} catch (error) {
			console.error(error)
		} finally {
			setLoading(false)
		}
	}, [client, setUserFavorites, user])

	//
	useEffect(() => {
		if (user) {
			fetchUserFavorites()
		}
	}, [fetchUserFavorites, user])

	// Create Favorite
	const handleCreate = useCallback(
		async eventId => {
			// console.log(`Creating`)
			try {
				let { status, error } = await client.from('favorites').insert({
					event_id: eventId,
					user_id: user?.id,
				})
				// console.log('insert', { status, error })
				// fetchUserFavorites()
			} catch (e) {
				console.error('create', e)
			}
		},
		[client, user?.id]
	)

	// Delete Favorite
	const handleDelete = useCallback(
		async eventId => {
			// console.log(`Deleting ID: ${eventId}`, user?.id)
			try {
				let { status, error } = await client.from('favorites').delete().match({
					event_id: eventId,
					user_id: user?.id,
				})
				// console.log('delete', { status, error })
				// fetchUserFavorites()
			} catch (e) {
				console.error('delete', e)
			}
		},
		[client, user?.id]
	)

	// ============================================================

	// Add/Remove User Favorite
	const toggleFavorite = useCallback(
		async (id, newState) => {
			if (isAuthed) {
				// console.log('UPDATING SUPABASE WITH FAVORITE')
				if (newState) {
					// console.log('CREATING FAVORITE')
					await handleCreate(id)
				} else {
					// console.log('DELETING FAVORITE')
					await handleDelete(id)
				}
				fetchUserFavorites()
			} else {
				const existing = JSON.parse(localStorage.getItem(favoritesStorageKey) || '[]')
				if (newState) {
					// console.log('ADDING NEW FAVORITE TO STORAGE')
					setFavorites([...existing, id])
				} else {
					// console.log('REMOVING FAVORITE FROM STORAGE')
					setFavorites(existing.filter(x => x !== id))
				}
			}
		},
		[fetchUserFavorites, handleCreate, handleDelete, isAuthed, setFavorites]
	)

	// ============================================================

	// Authenticated Persistence
	useEffect(() => {
		if (isAuthed) {
			// console.log('USER FAVES CHANGED', userFaves)
			// console.log('SUPABASE CHANGED. UPDATING STORAGE')
			// setFavorites(userFaves)
		}
	}, [isAuthed])

	// ============================================================

	// console.log({ userFaves, user })

	const value = useMemo(() => {
		return {
			favorites: isAuthed ? userFavoriteIds : favorites,
			toggleFavorite,
			userFavorites,
			localFavorites: favorites,
		}
	}, [favorites, isAuthed, toggleFavorite, userFavoriteIds, userFavorites])

	// console.log('FAVORITES', value)

	return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export const useFavoritesContext = () => useContext(FavoritesContext)

export default memo(FavoritesProvider)
