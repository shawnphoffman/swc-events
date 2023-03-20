import { DateTime } from 'luxon'

const cleanDataRelative = rawDate => {
	const cleaned = rawDate.replace(' ', 'T')
	const temp = DateTime.fromFormat(`${cleaned}`, "yyyy-MM-dd'T'HH:mm:ss").toISO()
	return temp
}

const cleanDataWithZone = rawDate => {
	const cleaned = rawDate.replace(' ', 'T')
	return DateTime.fromFormat(`${cleaned} Europe/London`, "yyyy-MM-dd'T'HH:mm:ss z", {
		setZone: 'Europe/London',
	})
}

const customEvents = [
	{
		id: 'beanie-1',
		summary: '2023 Star Wars Spelt Out Beanies!',
		description: `Come get your own special Star Wars Spelt Out 2023 beanie!`,
		venue: ' Collectibles',
		timezoneStartAt: 'Europe/London',
		startDate: cleanDataRelative('2023-04-07 10:00:00'),
		endDate: cleanDataRelative('2023-04-07 19:00:00'),
		startAt: cleanDataWithZone('2023-04-07 10:00:00'),
		endAt: cleanDataWithZone('2023-04-07 19:00:00'),
		color: 'var(--linkHover)',
		url: 'https://starwarsspeltout.podbean.com/',
		imageUrl: 'https://pbs.twimg.com/media/FqvBzqeaUAUa5yF?format=jpg&name=large',
	},
	{
		id: 'beanie-2',
		summary: '2023 Star Wars Spelt Out Beanies!',
		description: `Come get your own special Star Wars Spelt Out 2023 beanie!`,
		venue: ' Collectibles',
		timezoneStartAt: 'Europe/London',
		startDate: cleanDataRelative('2023-04-08T10:00:00'),
		endDate: cleanDataRelative('2023-04-08T19:00:00'),
		startAt: cleanDataWithZone('2023-04-08T10:00:00'),
		endAt: cleanDataWithZone('2023-04-08T19:00:00'),
		color: 'var(--linkHover)',
		url: 'https://starwarsspeltout.podbean.com/',
		imageUrl: 'https://pbs.twimg.com/media/FqvBzqeaUAUa5yF?format=jpg&name=large',
	},
	{
		id: 'beanie-3',
		summary: '2023 Star Wars Spelt Out Beanies!',
		description: `Come get your own special Star Wars Spelt Out 2023 beanie!`,
		venue: ' Collectibles',
		timezoneStartAt: 'Europe/London',
		startDate: cleanDataRelative('2023-04-09T10:00:00'),
		endDate: cleanDataRelative('2023-04-09T19:00:00'),
		startAt: cleanDataWithZone('2023-04-09T10:00:00'),
		endAt: cleanDataWithZone('2023-04-09T19:00:00'),
		color: 'var(--linkHover)',
		url: 'https://starwarsspeltout.podbean.com/',
		imageUrl: 'https://pbs.twimg.com/media/FqvBzqeaUAUa5yF?format=jpg&name=large',
	},
	{
		id: 'beanie-4',
		summary: '2023 Star Wars Spelt Out Beanies!',
		description: `Come get your own special Star Wars Spelt Out 2023 beanie!`,
		venue: ' Collectibles',
		timezoneStartAt: 'Europe/London',
		startDate: cleanDataRelative('2023-04-10T10:00:00'),
		endDate: cleanDataRelative('2023-04-10T17:00:00'),
		startAt: cleanDataWithZone('2023-04-10T10:00:00'),
		endAt: cleanDataWithZone('2023-04-10T17:00:00'),
		color: 'var(--linkHover)',
		url: 'https://starwarsspeltout.podbean.com/',
		imageUrl: 'https://pbs.twimg.com/media/FqvBzqeaUAUa5yF?format=jpg&name=large',
	},
	//
	{
		id: 'show-1',
		summary: 'Exhibit Hall Hours',
		description: `Official exhibit hall hours`,
		venue: ' Exhibit Hall',
		timezoneStartAt: 'Europe/London',
		startDate: cleanDataRelative('2023-04-07T10:00:00'),
		endDate: cleanDataRelative('2023-04-07T19:00:00'),
		startAt: cleanDataWithZone('2023-04-07T10:00:00'),
		endAt: cleanDataWithZone('2023-04-07T19:00:00'),
		color: 'var(--green)',
		url: 'https://www.starwarscelebration.com/en-us/show-information.html',
	},
	//
	{
		id: 'show-2',
		summary: 'Exhibit Hall Hours',
		description: `Official exhibit hall hours`,
		venue: ' Exhibit Hall',
		timezoneStartAt: 'Europe/London',
		startDate: cleanDataRelative('2023-04-08T10:00:00'),
		endDate: cleanDataRelative('2023-04-08T19:00:00'),
		startAt: cleanDataWithZone('2023-04-08T10:00:00'),
		endAt: cleanDataWithZone('2023-04-08T19:00:00'),
		color: 'var(--green)',
		url: 'https://www.starwarscelebration.com/en-us/show-information.html',
	},
	//
	{
		id: 'show-3',
		summary: 'Exhibit Hall Hours',
		description: `Official exhibit hall hours`,
		venue: ' Exhibit Hall',
		timezoneStartAt: 'Europe/London',
		startDate: cleanDataRelative('2023-04-09T10:00:00'),
		endDate: cleanDataRelative('2023-04-09T19:00:00'),
		startAt: cleanDataWithZone('2023-04-09T10:00:00'),
		endAt: cleanDataWithZone('2023-04-09T19:00:00'),
		color: 'var(--green)',
		url: 'https://www.starwarscelebration.com/en-us/show-information.html',
	},
	//
	{
		id: 'show-4',
		summary: 'Exhibit Hall Hours',
		description: `Official exhibit hall hours`,
		venue: ' Exhibit Hall',
		timezoneStartAt: 'Europe/London',
		startDate: cleanDataRelative('2023-04-10T10:00:00'),
		endDate: cleanDataRelative('2023-04-10T17:00:00'),
		startAt: cleanDataWithZone('2023-04-10T10:00:00'),
		endAt: cleanDataWithZone('2023-04-10T17:00:00'),
		color: 'var(--green)',
		url: 'https://www.starwarscelebration.com/en-us/show-information.html',
	},
]

export const processApiData = data => {
	if (!data || !data.schedules) return

	const venueSet = new Set()

	const events = data.schedules.map(s => {
		venueSet.add(s.location)
		return transformEvent(s)
	})

	customEvents.forEach(event => {
		events.push(event)
		venueSet.add(event.venue)
	})

	const sorted = events.sort((a, b) => {
		const aStart = new Date(a.startDate)
		const bStart = new Date(b.startDate)
		const aEnd = new Date(a.endDate)
		const bEnd = new Date(b.endDate)
		return aStart > bStart ? 1 : aStart === bStart ? (aEnd > bEnd ? 1 : -1) : -1
	})

	return {
		venues: Array.from(venueSet).sort((a, b) => (cleanVenueName(a) > cleanVenueName(b) ? 1 : -1)),
		events: sorted.filter(s => s.startDate.substring(0, 4) === '2023'),
	}
}

export const processApiVendors = data => {
	if (!data || !data.space_orders) return

	const vendors = []
	const tattooArtists = []

	const processBooth = booth => {
		if (booth.startsWith('TAT')) return ['TAT*']

		if (booth.startsWith('TP')) return ['TP*']

		return booth.split(', ')
	}

	const processUrl = url => {
		if (!url) return url
		if (url.startsWith('www')) {
			return `https://${url}`
		}
		return url
	}

	data.space_orders.forEach(s => {
		const company = decodeEntities(s.company).trim()
		if (company.toLowerCase().includes('testington')) {
			return
		}

		const vendor = {
			id: s.id,
			company: company,
			description: decodeEntities(s.description).trim(),
			booth: processBooth(s.booth),
			exclusives: s.exclusives,
			specials: s.specials,
			images: {
				small: s.image.small,
			},
			tags: s.tags,
			url: processUrl(s.store_url),
			featured: s.featured,
		}
		if (s.booth === 'Tattoo Pavilion') {
			tattooArtists.push(vendor)
			return
		}

		vendors.push(vendor)
	})

	return {
		vendors,
		tattooArtists,
	}
}

export const colorMap = {
	'Celebration LIVE! Stage': 'var(--color1)',
	'Celebration Stage': 'var(--color2)',
	'Collectors Stage': 'var(--color3)',
	'Fan Stage': 'var(--color4)',
	'Galaxy Stage': 'var(--color5)',
	'Holonet News Stage 14': 'var(--color6)',
	'Holonet News Stage 17': 'var(--color7)',
	'ICC Capital Suite 16': 'var(--color8)',
	'ICC Capital Suite 11': 'var(--color9)',
	'ICC Capital Suite 12': 'var(--color10)',
	'Kids Stage': 'var(--color11)',
	'Twin Suns Stage': 'var(--color12)',
	'University Stage': 'var(--color13)',
	' Collectibles': 'var(--color14)',
	' After Hours': 'var(--linkHover)',
	' Exhibit Hall': 'var(--color0)',

	//
}

export const cleanVenueName = v => {
	return v
		.replace('The ', '')
		.replace('Star Wars ', '')
		.replace('Performance ', '')
		.replace('(Room ', '')
		.replace(')', '')
		.replace('Suite Room ', 'Suite ')
}

export const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const dayColor = {
	[dayName[0]]: 'var(--day3)',
	[dayName[1]]: 'var(--day4)',
	[dayName[2]]: 'var(--day5)',
	[dayName[3]]: 'var(--day6)',
	[dayName[4]]: 'var(--day7)',
	[dayName[5]]: 'var(--day1)',
	[dayName[6]]: 'var(--day2)',
}

export const formatTime = time => {
	// console.log('1', { time })
	const temp = time.replace('+01:00', '')
	// console.log('2', { temp })
	return new Date(temp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase().replace(' ', '')
}

const transformEvent = rawEvent => {
	return {
		id: rawEvent.id,
		timezoneStartAt: 'Europe/London',
		startDate: cleanDataRelative(rawEvent.start_time),
		endDate: cleanDataRelative(rawEvent.end_time),
		startAt: cleanDataWithZone(rawEvent.start_time),
		endAt: cleanDataWithZone(rawEvent.end_time),
		summary: decodeEntities(rawEvent.title),
		description: decodeEntities(rawEvent.description),
		venue: rawEvent.location,
		color: colorMap[cleanVenueName(rawEvent.location)],
		url: `https://www.starwarscelebration.com/en-us/panels/panel-information.html?gtID=${rawEvent.id}`,
	}
}

export function decodeEntities(encodedString) {
	var translate_re = /&(nbsp|amp|quot|lt|gt);/g
	var translate = {
		nbsp: ' ',
		amp: '&',
		quot: '"',
		lt: '<',
		gt: '>',
	}
	return encodedString
		.replace(translate_re, function (match, entity) {
			return translate[entity]
		})
		.replace(/&#(\d+);/gi, function (match, numStr) {
			var num = parseInt(numStr, 10)
			return String.fromCharCode(num)
		})
}
