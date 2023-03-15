import { createContext, memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'

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
	const supabaseClient = useSupabaseClient()
	const user = useUser()

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
			// if (signinStatus === 'success' && signInCheckResult?.signedIn) {
			// 	const userFavRef = ref(database, `user-favorites/${user?.uid}/${id}`)
			// 	set(userFavRef, newState ? 'true' : null)
			// 	console.log('UPDATING FIREBASE WITH FAVORITE')
			// } else {
			const existing = JSON.parse(localStorage.getItem(favoritesStorageKey) || '[]')
			if (newState) {
				console.log('ADDING NEW FAVORITE TO STORAGE')
				setFavorites([...existing, id])
			} else {
				console.log('REMOVING FAVORITE FROM STORAGE')
				setFavorites(existing.filter(x => x !== id))
			}
			// }
		},
		// [database, setFavorites, signInCheckResult?.signedIn, signinStatus, user?.uid]
		[setFavorites]
	)

	// ============================================================

	// Authenticated Persistence
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
		return {
			favorites,
			toggleFavorite,
		}
	}, [favorites, toggleFavorite])

	return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export const useFavoritesContext = () => useContext(FavoritesContext)

export default memo(FavoritesProvider)
