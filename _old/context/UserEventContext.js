import { createContext, memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useAuth } from 'hooks/useAuth'

const initialState = {
	userEvents: [],
	addUserEvent: () => {},
	deleteUserEvent: () => {},
}

const UserEventContext = createContext(initialState)

const UserEventProvider = ({ children }) => {
	// Supabase
	const { client, user, isAuthed } = useAuth()
	// const [loading, setLoading] = useState(true)
	const [userEvents, setUserEvents] = useState([])

	// FETCH
	const fetchUserEvents = useCallback(async () => {
		if (!isAuthed || !user?.id || !client) {
			return
		}
		try {
			let { data, error } = await client.from('userEvents').select().eq('creator_id', user?.id) //.eq('private', true)
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
				// console.log('UserEvents', { temp, user })
				setUserEvents(temp)
			}
		} catch (e) {
			console.log(e)
		}
	}, [client, isAuthed, user])

	// INIT
	useEffect(() => {
		fetchUserEvents()
	}, [fetchUserEvents])

	// POLL BAYBEEE
	// useEffect(() => {
	// 	const intervalId = setInterval(() => {
	// 		console.log('POLL')
	// 		fetchUserEvents()
	// 	}, 5000)
	// 	return () => clearInterval(intervalId)
	// }, [fetchUserEvents])

	// ============================================================

	const insertRecord = useCallback(
		async event => {
			const { data, error } = await client.from('userEvents').insert([
				{
					id: event.id,
					summary: event.summary,
					description: event.description,
					venue: event.venue,
					timezoneStartAt: event.timezoneStartAt,
					startDate: event.startDate,
					endDate: event.endDate,
					startAt: event.startAt,
					endAt: event.endAt,
					color: event.color,
					url: event.url,
					address: event.address,
					imageUrl: event.imageUrl,
					type: event.type,
					private: event.private,
					creator_id: event.creator,
				},
			])
			// console.log('CREATE USER EVENT', { data, error, event })
		},
		[client]
	)

	const updateRecord = useCallback(
		async event => {
			// console.log('UPDATING')
			const { data, error } = await client
				.from('userEvents')
				.update({
					summary: event.summary,
					description: event.description,
					venue: event.venue,
					timezoneStartAt: event.timezoneStartAt,
					startDate: event.startDate,
					endDate: event.endDate,
					startAt: event.startAt,
					endAt: event.endAt,
					color: event.color,
					url: event.url,
					address: event.address,
					imageUrl: event.imageUrl,
					type: event.type,
					private: event.private,
					creator_id: event.creator,
				})
				.eq('id', event.id)
			// console.log('UPDATE USER EVENT', { data, error, event })
		},
		[client]
	)

	// Add User Event
	const addUserEvent = useCallback(
		async event => {
			if (!event.id) {
				event.id = uuidv4()
				await insertRecord(event)
			} else {
				await updateRecord(event)
			}
			await fetchUserEvents()
		},
		[fetchUserEvents, insertRecord, updateRecord]
	)

	const deleteUserEvent = useCallback(
		async id => {
			let { status, error } = await client.from('userEvents').delete().match({
				id: id,
				creator_id: user?.id,
			})
			// console.log('DELETE USER EVENT', { status, error, id })
			await fetchUserEvents()
		},
		[client, fetchUserEvents, user?.id]
	)

	// ============================================================

	const value = useMemo(() => {
		return {
			userEvents,
			addUserEvent,
			deleteUserEvent,
		}
	}, [addUserEvent, userEvents, deleteUserEvent])

	return <UserEventContext.Provider value={value}>{children}</UserEventContext.Provider>
}

export const useUserEventContext = () => useContext(UserEventContext)

export default memo(UserEventProvider)

/*


	// User Events
	// const userEvents = useMemo(() => {
	// 	// if (userEventsRep?.status !== 'success' || !userEventsRep?.data || customEventsRep?.status !== 'success' || !customEventsRep?.data)
	// 	// 	return null
	// 	// if (!userEventsRep?.data && !customEventsRep?.data) {
	// 	// 	return null
	// 	// } else {
	// 	// const customEvents = Object.keys(customEventsRep.data).reduce((memo, curr) => {

	// 	// 	return memo
	// 	// }, [])
	// 	// const temp = [...Object.values(userEventsRep.data), ...Object.values(customEventsRep.data)]
	// 	const temp = []

	// 	// console.log({
	// 	// 	user: userEventsRep.data,
	// 	// 	custom: customEventsRep.data,
	// 	// })

	// 	return temp.sort((a, b) => {
	// 		const aStart = new Date(a.startDate)
	// 		const bStart = new Date(b.startDate)
	// 		const aEnd = new Date(a.endDate)
	// 		const bEnd = new Date(b.endDate)

	// 		if (aStart > bStart) return 1

	// 		if (aStart < bStart) return -1

	// 		if (aEnd > bEnd) return 1

	// 		if (aEnd < bEnd) return -1

	// 		if (a.summary > b.summary) return 1

	// 		if (a.summary < b.summary) return -1

	// 		return 0
	// 	})
	// 	// }
	// 	// }, [customEventsRep.data, customEventsRep?.status, userEventsRep.data, userEventsRep?.status])
	// }, [])

	*/
