import { createContext, memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import useLocalStorage from 'hooks/useLocalStorage'
import { useAuth } from 'hooks/useAuth'

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

	//
	const fetchUserFavorites = useCallback(async () => {
		try {
			setLoading(true)

			let { data, status, error } = await client.from('favorites').select().eq('user_id', user.id)

			console.log('fetchUserFavorites', {
				data,
				status,
				error,
			})

			if (error && status !== 406) {
				throw error
			}

			if (data) {
				setUserFavorites(data)
			}
		} catch (error) {
			console.log('load', error)
			alert(error.message)
		} finally {
			setLoading(false)
		}
	}, [client, setUserFavorites, user])

	//
	useEffect(() => {
		if (user) {
			console.log('user > fetchUserFavorites')
			fetchUserFavorites()
		}
	}, [fetchUserFavorites, user])

	// Create Favorite
	const handleCreate = useCallback(
		async eventId => {
			console.log(`Creating`)
			try {
				let { status, error } = await client.from('favorites').insert({
					event_id: eventId,
					user_id: user?.id,
				})
				console.log('insert', { status, error })
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
			console.log(`Deleting ID: ${eventId}`)
			try {
				let { status, error } = await client.from('favorites').delete().eq('id', eventId)
				console.log('delete', { status, error })
				// fetchUserFavorites()
			} catch (e) {
				console.error('delete', e)
			}
		},
		[client]
	)

	// ============================================================

	// // Firebase
	// const { status: signinStatus, data: signInCheckResult } = useSigninCheck()
	// const { data: user } = useUser()
	// const database = useDatabase()

	// ============================================================

	// User Favorites Query
	// const userFavQ = useMemo(() => {
	// 	const userFavRef = ref(database, `user-favorites/${user?.uid}`)
	// 	const userFavQuery = query(userFavRef, orderByValue())
	// 	return query(userFavQuery, equalTo('true'))
	// }, [database, user])

	// User Favorites Resp
	// const userFavResp = useDatabaseObjectData(userFavQ, {})

	// User Favorite
	// const userFaves = useMemo(() => {
	// 	if (userFavResp?.status !== 'success' || !userFavResp?.data) return []
	// 	return Object.keys(userFavResp?.data) || []
	// }, [userFavResp?.data, userFavResp?.status])

	// ============================================================

	// Add/Remove User Favorite
	const toggleFavorite = useCallback(
		(id, newState) => {
			if (isAuthed) {
				console.log('UPDATING SUPABASE WITH FAVORITE')
				if (newState) {
					console.log('CREATING FAVORITE')
					handleCreate(id)
				} else {
					console.log('DELETING FAVORITE')
					handleDelete(id)
				}
				fetchUserFavorites()
			} else {
				const existing = JSON.parse(localStorage.getItem(favoritesStorageKey) || '[]')
				if (newState) {
					console.log('ADDING NEW FAVORITE TO STORAGE')
					setFavorites([...existing, id])
				} else {
					console.log('REMOVING FAVORITE FROM STORAGE')
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
			console.log('SUPABASE CHANGED. UPDATING STORAGE')
			// setFavorites(userFaves)
		}
	}, [isAuthed])
	// useEffect(() => {
	// 	if (signinStatus === 'success' && signInCheckResult?.signedIn && userFavResp.status === 'success') {
	// 		// console.log('USER FAVES CHANGED', userFaves)
	// 		console.log('FIREBASE CHANGED. UPDATING STORAGE')
	// 		setFavorites(userFaves)
	// 	}
	// }, [setFavorites, signInCheckResult?.signedIn, signinStatus, userFavResp.status, userFaves])

	// ============================================================

	// console.log({ userFaves, user })

	const value = useMemo(() => {
		const userFavoriteIds = userFavorites?.map(f => f.event_id)
		return {
			favorites: isAuthed ? userFavoriteIds : favorites,
			toggleFavorite,
			userFavorites,
			localFavorites: favorites,
		}
	}, [favorites, isAuthed, toggleFavorite, userFavorites])

	console.log('FAVORITES', value)

	return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export const useFavoritesContext = () => useContext(FavoritesContext)

export default memo(FavoritesProvider)
