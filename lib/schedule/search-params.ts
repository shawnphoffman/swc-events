import { parseAsArrayOf, parseAsBoolean, parseAsString } from 'nuqs'

/** URL state for schedule views, so a filtered view is shareable and survives reloads. */
export const scheduleSearchParams = {
	day: parseAsString,
	q: parseAsString.withDefault(''),
	stages: parseAsArrayOf(parseAsString).withDefault([]),
	mine: parseAsBoolean.withDefault(false),
}
