import { memo } from 'react'
import Agenda from 'components/events/Agenda'

import { useEventContext } from 'context/EventContext'
import Filters from 'components/events/Filters'

const dataUrl = process.env.NEXT_PUBLIC_SCHEDULE_ENDPOINT

// Server data fetch
// export async function getServerSideProps(context) {
// 	const res = await fetch(dataUrl)
// 	const data = await res.json()

// 	context.res.setHeader('Cache-Control', 'public, s-maxage=6000, stale-while-revalidate=3000')

// 	return {
// 		props: {
// 			data: data,
// 		},
// 	}
// }

const Schedule = ({ data }) => {
	const [state] = useEventContext()

	// console.log({ data });
	return (
		<div>
			<Filters />
			<Agenda />
			{/* <h1>SCHEDULE</h1>
			<hr /> */}
			{/* <div>
				<code>
					<pre>{JSON.stringify(state, null, 2)}</pre>
				</code>
				<code>
					<pre>{JSON.stringify(data, null, 2)}</pre>
				</code>
			</div> */}
		</div>
	)
}

export default memo(Schedule)
