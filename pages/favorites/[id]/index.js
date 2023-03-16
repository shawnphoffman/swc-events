import { memo, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from 'hooks/useAuth'
import Loading from 'components/Loading'

const Page = () => {
	const { client } = useAuth()
	const router = useRouter()
	const { id } = router.query
	const [tempFaves, setTempFaves] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchFaves = async () => {
			try {
				setLoading(true)

				let { data, status, error } = await client.from('favorites').select().eq('user_id', id)

				console.log('fetchFaves', {
					data,
					status,
					error,
				})

				if (error && status !== 406) {
					throw error
				}

				if (data) {
					setTempFaves(data)
				}
			} catch (error) {
				console.log('load', error)
				// alert(error.message)
			} finally {
				setLoading(false)
			}
		}
		fetchFaves()
	}, [client, id])

	return (
		<div>
			<h1>Fave: {id}</h1>
			{loading ? <Loading /> : null}
			{tempFaves?.length ? <pre>{JSON.stringify(tempFaves, null, 2)}</pre> : <div>No favorites found...</div>}
		</div>
	)
}

export default memo(Page)
