import { describe, expect, it } from 'vitest'

import {
	buildSchedule,
	buildVendors,
	cleanText,
	cleanVenueName,
	decodeEntities,
	normalizeScheduleItem,
	parseShowTime,
	showDate,
} from './normalize'
import { sampleScheduleItems } from './sample'

describe('parseShowTime', () => {
	it('treats feed timestamps as venue wall-clock time', () => {
		expect(parseShowTime('2027-04-01 10:00:00')).toBe('2027-04-01T10:00:00.000-07:00')
	})

	it('is independent of the server time zone', () => {
		const original = process.env.TZ
		process.env.TZ = 'Asia/Tokyo'
		try {
			expect(parseShowTime('2027-04-01 23:30:00')).toBe('2027-04-01T23:30:00.000-07:00')
		} finally {
			process.env.TZ = original
		}
	})

	it('respects explicit offsets', () => {
		expect(parseShowTime('2027-04-01T17:00:00Z')).toBe('2027-04-01T10:00:00.000-07:00')
	})

	it('rejects garbage', () => {
		expect(parseShowTime('TBD')).toBeNull()
	})
})

describe('showDate', () => {
	it('uses the show calendar day, not UTC', () => {
		// 11pm PT is already the next day in UTC
		expect(showDate('2027-04-01T23:00:00.000-07:00')).toBe('2027-04-01')
	})
})

describe('text cleanup', () => {
	it('decodes named, decimal and hex entities', () => {
		expect(decodeEntities('R2 &amp; C-3PO &#8217;s &#x2014; &quot;hi&quot;')).toBe('R2 & C-3PO \u2019s \u2014 "hi"')
	})

	it('flattens light HTML', () => {
		expect(cleanText('<p>One</p><p>Two<br/>Three</p>')).toBe('One\n\nTwo\nThree')
	})

	it('cleans venue names', () => {
		expect(cleanVenueName('The Star Wars Galaxy Stage')).toBe('Galaxy Stage')
		expect(cleanVenueName('Holonet News Stage (Room 403)')).toBe('Holonet News Stage 403')
	})
})

describe('normalizeScheduleItem', () => {
	it('coerces numeric ids to strings so URL params match', () => {
		const event = normalizeScheduleItem({
			id: 123,
			title: 'Panel',
			location: 'Galaxy Stage',
			start_time: '2027-04-02 11:00:00',
			end_time: '2027-04-02 12:00:00',
		})
		expect(event?.id).toBe('123')
		expect(event?.day).toBe('2027-04-02')
		expect(event?.venueSlug).toBe('galaxy-stage')
	})

	it('clamps an end before start to a point-in-time event', () => {
		const event = normalizeScheduleItem({ id: 1, title: 'x', location: 'y', start_time: '2027-04-02 11:00:00', end_time: '2027-04-02 10:00:00' })
		expect(event?.end).toBe(event?.start)
	})

	it('drops rows without a parseable start', () => {
		expect(normalizeScheduleItem({ id: 1, title: 'x', start_time: 'soon' })).toBeNull()
	})
})

describe('buildSchedule', () => {
	it('filters other years, dedupes by id and sorts by start, end, title', () => {
		const schedule = buildSchedule(
			[
				{ id: 2, title: 'B', location: 'Stage', start_time: '2027-04-01 10:00:00', end_time: '2027-04-01 11:00:00' },
				{ id: 1, title: 'A', location: 'Stage', start_time: '2027-04-01 10:00:00', end_time: '2027-04-01 11:00:00' },
				{ id: 3, title: 'Old', location: 'Stage', start_time: '2025-04-18 10:00:00', end_time: '2025-04-18 11:00:00' },
				{ id: 1, title: 'A (updated)', location: 'Stage', start_time: '2027-04-01 10:00:00', end_time: '2027-04-01 11:00:00' },
			],
			'live'
		)
		expect(schedule.events.map(e => e.title)).toEqual(['A (updated)', 'B'])
		expect(schedule.days).toEqual([{ date: '2027-04-01', eventCount: 2 }])
		expect(schedule.venues).toHaveLength(1)
	})

	it('normalizes the full sample feed without dropping rows', () => {
		const raw = sampleScheduleItems()
		const schedule = buildSchedule(raw, 'sample')
		expect(schedule.events).toHaveLength(raw.length)
		expect(schedule.days.map(d => d.date)).toEqual(['2027-04-01', '2027-04-02', '2027-04-03', '2027-04-04'])
	})
})

describe('buildVendors', () => {
	it('normalizes urls, drops test vendors and flags tattoo artists', () => {
		const vendors = buildVendors([
			{ id: 1, company: 'Acme &amp; Co', booth: '101, 102', store_url: 'www.example.com' },
			{ id: 2, company: 'Testington Inc', booth: '1' },
			{ id: 3, company: 'Ink', booth: 'Tattoo Pavilion', store_url: 'javascript:alert(1)' },
		])
		expect(vendors.map(v => v.company)).toEqual(['Acme & Co', 'Ink'])
		expect(vendors[0]).toMatchObject({ booths: ['101', '102'], url: 'https://www.example.com/' })
		expect(vendors[1]).toMatchObject({ isTattoo: true, url: undefined })
	})
})
