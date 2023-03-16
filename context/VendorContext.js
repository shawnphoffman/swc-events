import React, { createContext, memo, useContext, useEffect, useReducer } from 'react'

const VendorContext = createContext()

export const VendorAction = {
	SET_VENDORS: 'SET_VENDORS',
}

const initialReducerState = {
	allVendors: [],
	allTattoos: [],
}

const reducer = (state, action) => {
	switch (action.type) {
		case VendorAction.SET_VENDORS:
			// Don't set it multiple times
			if (state.allVendors.length > 0) {
				return state
			}
			return {
				...state,
				allVendors: action.vendors,
				allTattoos: action.tattooArtists,
			}
		default:
			return state
	}
}

const VendorProvider = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, initialReducerState)

	useEffect(() => {
		fetch('/api/vendors')
			.then(res => res.json())
			.then(data => {
				const { vendors, tattooArtists } = data
				dispatch({ type: VendorAction.SET_VENDORS, vendors, tattooArtists })
			})
	}, [])

	return <VendorContext.Provider value={[state, dispatch]}>{children}</VendorContext.Provider>
}

export const useVendorContext = () => useContext(VendorContext)

export default memo(VendorProvider)
