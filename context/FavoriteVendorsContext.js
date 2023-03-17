import { createContext, memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { useAuth } from 'hooks/useAuth'
import useLocalStorage from 'hooks/useLocalStorage'

const favoritesStorageKey = 'SWC.FavoriteVendors.2023'

const initialState = {
	favorites: [],
	toggleFavorite: () => {},
}

const FavoriteVendorsContext = createContext(initialState)

const FavoriteVendorsProvider = ({ children }) => {
	// Non-Auth Storage
	const [favorites, setFavorites] = useLocalStorage(favoritesStorageKey, [])

	// ============================================================

	// Supabase
	const { client, user, isAuthed } = useAuth()
	const [loading, setLoading] = useState(true)
	const [userVendors, setUserVendors] = useState([])
	const userVendorIds = useMemo(() => {
		return userVendors?.map(f => f.vendor_id)
	}, [userVendors])

	//
	const fetchUserVendors = useCallback(async () => {
		try {
			setLoading(true)

			let { data, status, error } = await client.from('favoriteVendors').select().eq('user_id', user.id)

			// console.log('fetchUserVendors', {
			// 	data,
			// 	status,
			// 	error,
			// })

			if (error && status !== 406) {
				throw error
			}

			if (data) {
				setUserVendors(data)
			}
		} catch (error) {
			// console.log('load', error)
			alert(error.message)
		} finally {
			setLoading(false)
		}
	}, [client, setUserVendors, user])

	//
	useEffect(() => {
		if (user) {
			// console.log('user > fetchUserVendors')
			fetchUserVendors()
		}
	}, [fetchUserVendors, user])

	// Create Favorite
	const handleCreate = useCallback(
		async vendorId => {
			// console.log(`Creating`)
			try {
				let { status, error } = await client.from('favoriteVendors').insert({
					vendor_id: vendorId,
					user_id: user?.id,
				})
				// console.log('insert', { status, error })
			} catch (e) {
				console.error('create', e)
			}
		},
		[client, user?.id]
	)

	// Delete Favorite
	const handleDelete = useCallback(
		async vendorId => {
			// console.log(`Deleting ID: ${vendorId}`)
			try {
				let { status, error } = await client.from('favoriteVendors').delete().match({
					vendor_id: vendorId,
					user_id: user?.id,
				})
				// console.log('delete', { status, error })
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
				// console.log('UPDATING SUPABASE WITH FAVORITE VENDOR')
				if (newState) {
					// console.log('CREATING FAVORITE VENDOR')
					await handleCreate(id)
				} else {
					// console.log('DELETING FAVORITE VENDOR')
					await handleDelete(id)
				}
				fetchUserVendors()
			} else {
				const existing = JSON.parse(localStorage.getItem(favoritesStorageKey) || '[]')
				if (newState) {
					// console.log('ADDING NEW FAVORITE VENDOR TO STORAGE')
					setFavorites([...existing, id])
				} else {
					// console.log('REMOVING FAVORITE VENDOR FROM STORAGE')
					setFavorites(existing.filter(x => x !== id))
				}
			}
		},
		[fetchUserVendors, handleCreate, handleDelete, isAuthed, setFavorites]
	)

	// ============================================================

	// Authenticated Persistence
	useEffect(() => {
		if (isAuthed) {
			// console.log('USER FAVES CHANGED', userFaves)
			// console.log('SUPABASE VENDORS CHANGED. UPDATING STORAGE')
			// setFavorites(userFaves)
		}
	}, [isAuthed])

	// ============================================================

	// console.log({ userFaves, user })

	const value = useMemo(() => {
		return {
			favorites: isAuthed ? userVendorIds : favorites,
			toggleFavorite,
			userVendors,
			localVendors: favorites,
		}
	}, [favorites, isAuthed, toggleFavorite, userVendorIds, userVendors])

	// console.log('FAVORITE VENDORS', value)

	return <FavoriteVendorsContext.Provider value={value}>{children}</FavoriteVendorsContext.Provider>
}

export const useFavoriteVendorsContext = () => useContext(FavoriteVendorsContext)

export default memo(FavoriteVendorsProvider)
