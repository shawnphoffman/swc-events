import type { MetadataRoute } from 'next'

/**
 * Public companion: allow crawling so people searching for the schedule find it.
 * Calendar exports are per-event/per-selection files with no search value.
 */
export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			allow: '/',
			disallow: ['/event/*/calendar.ics', '/my-schedule/calendar.ics'],
		},
	}
}
