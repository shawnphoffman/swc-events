import { processApiData } from 'utils/dataUtils'

const url = process.env.NEXT_PUBLIC_SCHEDULE_ENDPOINT

export default async function handler(req, res) {
	const resp = await fetch(url)
	const json = await resp.json()

	const { events, venues } = processApiData(json)

	res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=599')

	res.status(200).json({
		events,
		venues,
	})
	return
}
