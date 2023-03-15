import { processApiVendors } from 'utils/dataUtils'

const url = process.env.NEXT_PUBLIC_VENDOR_ENDPOINT

export default async function handler(req, res) {
	// try {
	const resp = await fetch(url)
	const json = await resp.json()

	// console.log(json)
	console.log('FIRE')

	const { vendors, tattooArtists } = processApiVendors(json)

	res.status(200).json({
		vendors,
		tattooArtists,
	})
	return
	// } catch (e) {
	// 	console.log(e)

	// 	import('data/schedule.json').then(j => console.log(j))

	// 	const { events, venues } = processApiData(json)
	// 	res.status(200).json({
	// 		events,
	// 		venues,
	// 	})
	// 	// dispatch({ type: EventAction.SET_EVENTS, name: events, venues: venues, disabled: disabledVenues })
	// 	return
	// }

	// res.status(200).json({ name: 'John Doe' })
}
