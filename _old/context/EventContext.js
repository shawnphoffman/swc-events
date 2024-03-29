import React, { createContext, memo, useContext, useEffect, useReducer, useState } from 'react'

import { usePublicUserEventContext } from './PublicUserEventContext'
import { useUserEventContext } from './UserEventContext'

const disabledVenueStorageKey = 'SWC.DisabledVenues.2023'

const EventContext = createContext()

export const EventAction = {
	TOGGLE_VENUE: 'TOGGLE_VENUE',
	ALL_VENUES_ON: 'ALL_VENUES_ON',
	ALL_VENUES_OFF: 'ALL_VENUES_OFF',
	SET_EVENTS: 'SET_EVENTS',
	UPDATE_PUBLIC_EVENTS: 'UPDATE_PUBLIC_EVENTS',
	UPDATE_USER_EVENTS: 'UPDATE_USER_EVENTS',
}

const initialReducerState = {
	allEvents: [],
	allVenues: [],
	coreEvents: [],
	publicEvents: [],
	userEvents: [],
	disabledVenues: [],
}

function removeDuplicatesBy(keyFn, array) {
	var mySet = new Set()
	return array.filter(function (x) {
		var key = keyFn(x),
			isNew = !mySet.has(key)
		if (isNew) mySet.add(key)
		return isNew
	})
}

const sortDemBitches = events => {
	const deduped = removeDuplicatesBy(x => x.id, events)

	return deduped.sort((a, b) => {
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
}

const reducer = (state, action) => {
	switch (action.type) {
		case EventAction.SET_EVENTS:
			// Don't set it multiple times
			if (state.allEvents.length > 0 && state.coreEvents.length > 0) {
				console.log("SHOULD'VE AVOIDED THIS")
				// return state
			}
			return {
				...state,
				allEvents: sortDemBitches([...action.name, ...state.publicEvents, ...state.userEvents]),
				coreEvents: action.name,
				allVenues: action.venues,
				disabledVenues: action.disabled,
			}
		case EventAction.TOGGLE_VENUE:
			const isAdding = state.disabledVenues.includes(action.name)
			if (isAdding) {
				const newVenues = state.disabledVenues.filter(v => v !== action.name)
				return {
					...state,
					disabledVenues: newVenues,
				}
			} else {
				const newVenues = [...state.disabledVenues, action.name]
				return {
					...state,
					disabledVenues: newVenues,
				}
			}
		case EventAction.ALL_VENUES_ON:
			return {
				...state,
				disabledVenues: [],
			}
		case EventAction.ALL_VENUES_OFF:
			return {
				...state,
				disabledVenues: [...state.allVenues, 'Public Events', 'My Events'],
			}
		case EventAction.UPDATE_PUBLIC_EVENTS:
			if (state.publicEvents.length === action.name.length) {
				return state
			}
			return {
				...state,
				allEvents: sortDemBitches([...action.name, ...state.coreEvents, ...state.userEvents]),
				publicEvents: action.name,
			}
		case EventAction.UPDATE_USER_EVENTS:
			if (state.userEvents.length === action.name.length) {
				return state
			}
			return {
				...state,
				allEvents: sortDemBitches([...action.name, ...state.coreEvents, ...state.publicEvents]),
				userEvents: action.name,
			}
		default:
			return state
	}
}

const EventProvider = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, initialReducerState)
	const [loading, setLoading] = useState(true)
	const { publicEvents } = usePublicUserEventContext()
	const { userEvents } = useUserEventContext()

	useEffect(() => {
		// console.log('EventContext.init')
		setLoading(true)

		const fetchEvents = async () => {
			let disabledVenues = []
			const raw = localStorage.getItem(disabledVenueStorageKey)
			if (raw) {
				const stored = JSON.parse(raw)
				// console.log('STORED', stored)
				if (Array.isArray(stored)) {
					disabledVenues = stored
				}
			}

			const resp = await fetch('/api/schedule')
			const data = await resp.json()
			const { events, venues } = data
			dispatch({ type: EventAction.SET_EVENTS, name: events, venues: venues, disabled: disabledVenues })
			setLoading(false)
		}
		fetchEvents()
	}, [])

	useEffect(() => {
		localStorage.setItem(disabledVenueStorageKey, JSON.stringify(state.disabledVenues))
	}, [state.disabledVenues])

	useEffect(() => {
		dispatch({ type: EventAction.UPDATE_PUBLIC_EVENTS, name: publicEvents })
	}, [publicEvents])

	useEffect(() => {
		dispatch({ type: EventAction.UPDATE_USER_EVENTS, name: userEvents })
	}, [userEvents])

	return <EventContext.Provider value={[state, dispatch, loading]}>{children}</EventContext.Provider>
}

export const useEventContext = () => useContext(EventContext)

export default memo(EventProvider)
