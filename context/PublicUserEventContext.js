import { createContext, memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { useAuth } from 'hooks/useAuth'

const initialState = {
	publicEvents: [],
}

const PublicUserEventContext = createContext(initialState)

const PublicUserEventProvider = ({ children }) => {
	// Supabase
	const { client, user } = useAuth()
	const [publicEvents, setPublicEvents] = useState([])

	// FETCH
	const fetchPublicEvents = useCallback(async () => {
		if (!client) {
			return
		}
		try {
			let { data, error } = user
				? await client.from('userEvents').select().eq('private', false).neq('creator_id', user?.id)
				: await client.from('userEvents').select().eq('private', false)

			if (error) {
				console.error(error)
			}
			if (data) {
				// console.log('PUBLIC', data)

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
				setPublicEvents(temp)
			}
		} catch (e) {
			console.log(e)
		}
	}, [client, user])

	// INIT
	useEffect(() => {
		fetchPublicEvents()
	}, [fetchPublicEvents])

	// POLL BAYBEEE
	useEffect(() => {
		const intervalId = setInterval(() => {
			// console.log('POLL')
			fetchPublicEvents()
		}, 30000)
		return () => clearInterval(intervalId)
	}, [fetchPublicEvents])

	// ============================================================

	const value = useMemo(() => {
		return {
			publicEvents,
		}
	}, [publicEvents])

	return <PublicUserEventContext.Provider value={value}>{children}</PublicUserEventContext.Provider>
}

export const usePublicUserEventContext = () => useContext(PublicUserEventContext)

export default memo(PublicUserEventProvider)