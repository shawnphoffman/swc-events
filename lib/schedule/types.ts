export type ScheduleEvent = {
	id: string
	title: string
	description: string
	venue: string
	venueSlug: string
	/** ISO 8601 with the show's UTC offset, e.g. 2027-04-01T10:00:00.000-07:00 */
	start: string
	end: string
	/** Local show date (YYYY-MM-DD) the event starts on. */
	day: string
	url?: string
	imageUrl?: string
	source: 'official' | 'custom'
}

export type Venue = {
	name: string
	slug: string
	/** Index into the venue palette (see venueColor). */
	colorIndex: number
	eventCount: number
}

export type ShowDay = {
	/** YYYY-MM-DD */
	date: string
	eventCount: number
}

export type Schedule = {
	events: ScheduleEvent[]
	venues: Venue[]
	days: ShowDay[]
	status: 'live' | 'sample' | 'unpublished' | 'error'
	fetchedAt: string
}

export type Vendor = {
	id: string
	company: string
	description: string
	booths: string[]
	specials: { id: string; title: string; price?: string; link?: string }[]
	imageUrl?: string
	url?: string
	featured: boolean
	isTattoo: boolean
}

export type VendorList = {
	vendors: Vendor[]
	status: 'live' | 'sample' | 'unpublished' | 'error'
	fetchedAt: string
}
