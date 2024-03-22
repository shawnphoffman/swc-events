import { processApiVendors } from 'utils/dataUtils'

const url = process.env.NEXT_PUBLIC_VENDOR_ENDPOINT

export default async function handler(req, res) {
	const resp = await fetch(url)
	const json = await resp.json()

	const { vendors, tattooArtists } = processApiVendors(json)

	res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=599')

	res.status(200).json({
		vendors,
		tattooArtists,
	})
	return
}
