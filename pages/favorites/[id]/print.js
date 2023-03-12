import { memo } from 'react'
import { useRouter } from 'next/router'

const Page = () => {
	const router = useRouter()
	const { id } = router.query

	return (
		<div>
			<h1>Print Fave: {id}</h1>
		</div>
	)
}

export default memo(Page)
