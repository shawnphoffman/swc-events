import { memo, useCallback, useEffect, useState } from 'react'
import { supabase } from 'utils/supabaseClient'

// export async function getServerSideProps() {
// 	let { data, status, error } = await supabase.from('favorites').select()
// 	console.log({ data, status, error })
// 	return {
// 		props: {
// 			favorites: data,
// 		},
// 	}
// }

const Page = () => {
	const [loading, setLoading] = useState(true)
	const [favorites, setFavorites] = useState([])

	const getFavorites = useCallback(async () => {
		try {
			setLoading(true)

			let { data, status, error } = await supabase.from('favorites').select()

			console.log({
				data,
				status,
				error,
			})

			if (error && status !== 406) {
				throw error
			}

			if (data) {
				setFavorites(data)
				// 	setUsername(data.username)
				// 	setWebsite(data.website)
				// 	setAvatarUrl(data.avatar_url)
			}
		} catch (error) {
			alert(error.message)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		getFavorites()
	}, [getFavorites])

	return (
		<div>
			<h1>My Favorites</h1>
			<ul>
				{favorites?.map(event => (
					<li key={event.id}>{event.event_id}</li>
				))}
			</ul>
		</div>
	)
}

export default memo(Page)
