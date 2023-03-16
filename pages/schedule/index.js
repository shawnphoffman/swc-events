import { memo } from 'react'

import Agenda from 'components/events/Agenda'
import Filters from 'components/events/Filters'

const Schedule = () => {
	return (
		<>
			<Filters />
			<Agenda />
		</>
	)
}

export default memo(Schedule)
