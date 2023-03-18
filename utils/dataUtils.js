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

const colorList = [
	'#FF8C00', // 0
	'#ffab00', // 1
	'#ffd600', // 2
	'#aeea00', // 3
	'#00c853', // 4
	'#00bfa5', // 5
	'#00b8d4', // 6
	'#0091ea', // 7
	'#304ffe', // 8
	'#6200ea', // 9
	'#aa00ff', // 10
	'#c51162', // 11
	'#d50000', // 12
]
export const colorMap = {
	'Celebration LIVE! Stage': colorList[0],
	'Celebration Stage': colorList[1],
	'Collectors Stage': colorList[2],
	'Fan Stage': colorList[3],
	'Galaxy Stage': colorList[4],
	'Holonet News Stage 14': colorList[5],
	'Holonet News Stage 17': colorList[6],
	'ICC Capital Suite 16': colorList[7],
	'ICC Capital Suite 11': colorList[8],
	'ICC Capital Suite 12': colorList[9],
	'Kids Stage': colorList[10],
	'Twin Suns Stage': colorList[11],
	'University Stage': colorList[12],
	' Collectibles': 'var(--linkHover)',
	' After Hours': 'var(--linkHover)',
	' Exhibit Hall': 'var(--green)',

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
	[dayName[2]]: 'var(--outline)',
	[dayName[3]]: 'var(--outline)',
	[dayName[4]]: 'var(--outline)',
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
