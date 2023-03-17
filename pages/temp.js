import { memo } from 'react'
import { DateTime } from 'luxon'

const Page = () => {
	const api = '2023-04-07 10:00:00'
	const cleaned = api.replace(' ', 'T')
	const dt = DateTime.fromFormat(`${cleaned} Europe/London`, "yyyy-MM-dd'T'HH:mm:ss z", {
		setZone: 'Europe/London',
	})

	return (
		<div>
			<h1>Temp</h1>
			<div>This date should be 10:00AM GMT</div>
			<div>{dt.toISO()}</div>
			<pre>
				<code>{JSON.stringify(dt, null, 2)}</code>
			</pre>
		</div>
	)
}

export default memo(Page)
