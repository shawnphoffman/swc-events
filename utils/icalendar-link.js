import * as React from 'react'

var extendStatics = function (d, b) {
	extendStatics =
		Object.setPrototypeOf ||
		({ __proto__: [] } instanceof Array &&
			function (d, b) {
				d.__proto__ = b
			}) ||
		function (d, b) {
			for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]
		}
	return extendStatics(d, b)
}

function __extends(d, b) {
	extendStatics(d, b)
	function __() {
		this.constructor = d
	}
	d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __())
}

var __assign = function () {
	__assign =
		Object.assign ||
		function __assign(t) {
			for (var s, i = 1, n = arguments.length; i < n; i++) {
				s = arguments[i]
				for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
			}
			return t
		}
	return __assign.apply(this, arguments)
}

// https://raw.githubusercontent.com/josephj/react-icalendar-link/master/src/utils.ts
function pad(num) {
	if (num < 10) {
		return `0${num}`
	}
	return `${num}`
}

export function formatDate(dateString) {
	const dateTime = new Date(dateString)
	return [
		dateTime.getUTCFullYear(),
		pad(dateTime.getUTCMonth() + 1),
		pad(dateTime.getUTCDate()),
		'T',
		pad(dateTime.getUTCHours()),
		pad(dateTime.getUTCMinutes()) + '00Z',
	].join('')
}

export function buildUrl(event, useDataURL = false, rawContent = '') {
	const body = []

	if (!event || !event.startTime || !event.title) throw Error('Both startTime and title fields are mandatory')

	body.push(`DTSTART:${formatDate(event.startTime)}`)
	body.push(`SUMMARY:${event.title}`)

	event.url && body.push(`URL:${event.url}`)
	event.attendees &&
		event.attendees.forEach(attendee => {
			const regExp = /^([^<]+)\s*<(.+)>/
			const matches = attendee.match(regExp)
			if (matches) {
				const name = matches[1]
				const email = matches[2]
				body.push(
					[
						'ATTENDEE',
						`CN=${name}`,
						'CUTYPE=INDIVIDUAL',
						'PARTSTAT=NEEDS-ACTION',
						'ROLE=REQ-PARTICIPANT',
						`RSVP=TRUE:mailto:${email}`,
					].join(';')
				)
			}
		})
	event.endTime && body.push(`DTEND:${formatDate(event.endTime)}`)
	event.description && body.push(`DESCRIPTION:${event.description}`)
	event.location && body.push(`LOCATION:${event.location}`)
	rawContent && body.push(rawContent)

	const url = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', body.join('\n'), 'END:VEVENT', 'END:VCALENDAR'].join('\n')

	if (useDataURL) {
		return encodeURI(`data:text/calendar;charset=utf8,${url}`)
	} else {
		return url
	}
}

export function downloadBlob(blob, filename) {
	const linkEl = document.createElement('a')
	linkEl.href = window.URL.createObjectURL(blob).replace('blob:http', 'webcal')
	linkEl.setAttribute('download', filename)

	document.body.appendChild(linkEl)
	linkEl.click()
	document.body.removeChild(linkEl)
}

export function isCrappyIE() {
	return !!(typeof window !== 'undefined' && window.navigator.msSaveOrOpenBlob && window.Blob)
}

export function isIOSSafari() {
	const ua = window.navigator.userAgent
	const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i)
	const webkit = !!ua.match(/WebKit/i)

	return iOS && webkit && !ua.match(/CriOS/i)
}

export function isIOSChrome() {
	const ua = window.navigator.userAgent
	const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i)

	return iOS && !!ua.match(/CriOS/i)
}

/**
 * @class ICalLink
 */
var ICalLink = /** @class */ (function (_super) {
	__extends(ICalLink, _super)
	function ICalLink(props) {
		var _this = _super.call(this, props) || this
		_this.handleClick = function (e) {
			e.preventDefault()
			e.stopPropagation()
			var _a = _this.props,
				event = _a.event,
				filename = _a.filename,
				rawContent = _a.rawContent
			var url = buildUrl(event, isIOSSafari(), rawContent)
			var blob = new Blob([url], {
				type: 'text/calendar;charset=utf-8',
			})
			// IE
			if (_this.isCrappyIE) {
				window.navigator.msSaveOrOpenBlob(blob, filename)
				return
			}
			// Safari
			if (isIOSSafari()) {
				window.open(url, '_blank')
				return
			}
			// Desktop
			downloadBlob(blob, filename)
		}
		_this.isCrappyIE = !!(typeof window !== 'undefined' && window.navigator.msSaveOrOpenBlob && window.Blob)
		return _this
	}
	ICalLink.prototype.render = function () {
		var _a = this.props,
			children = _a.children,
			href = _a.href,
			className = _a.className
		return React.createElement('a', __assign({ onClick: this.handleClick }, { href: href, className: className }), children)
	}
	// FIXME - iOS Chrome doesn't support adding to iCal at the moment.
	// https://bugs.chromium.org/p/chromium/issues/detail?id=666211
	ICalLink.isSupported = function () {
		return !isIOSChrome()
	}
	ICalLink.defaultProps = {
		filename: 'download.ics',
		href: '#add-to-calendar',
		rawContent: '',
	}
	return ICalLink
})(React.Component)

export { ICalLink as default }
