/**
 * Single source of truth for the show this deployment targets.
 * Rolling to a new Celebration should only require editing this file
 * (plus any show-specific custom events in lib/schedule/custom-events.ts).
 */
export const celebration = {
	year: 2027,
	name: 'Star Wars Celebration Los Angeles',
	shortName: 'Celebration 2027',
	appName: 'Celebration 2027 Companion',
	city: 'Los Angeles',
	location: 'Los Angeles Convention Center',
	address: '1201 S Figueroa St, Los Angeles, CA 90015',
	timeZone: 'America/Los_Angeles',
	/** Show days as local calendar dates (inclusive). */
	firstDay: '2027-04-01',
	lastDay: '2027-04-04',
	/**
	 * Countdown target: doors open, local time. The explicit offset pins the
	 * instant, so it is correct regardless of the server's time zone.
	 * (A previous hardcoded epoch, 1806584400000, was 06:00 PT, 4 hours early.)
	 */
	startsAt: '2027-04-01T10:00:00-07:00',
	/** After this the home page switches to its post-show state. */
	endsAt: '2027-04-04T23:59:59-07:00',
	officialSite: 'https://www.starwarscelebration.com/en-us.html',
	panelUrl: (id: string) => `https://www.starwarscelebration.com/en-us/panels/panel-information.html?gtID=${encodeURIComponent(id)}`,
	siteUrl: 'https://swc.events',
	storagePrefix: 'SWC.2027',
} as const

export type Celebration = typeof celebration
