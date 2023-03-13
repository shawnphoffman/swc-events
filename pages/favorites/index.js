import { memo, useCallback, useEffect, useState } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
// import { Auth } from '@supabase/auth-ui-react'
// import { ThemeSupa } from '@supabase/auth-ui-shared'

const Page = () => {
	const supabaseClient = useSupabaseClient()
	const user = useUser()
	const [loading, setLoading] = useState(true)
	const [favorites, setFavorites] = useState([])
	const [text, setText] = useState('')

	const loadData = useCallback(async () => {
		try {
			setLoading(true)

			let { data, status, error } = await supabaseClient.from('favorites').select()

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
			console.log(error)
			alert(error.message)
		} finally {
			setLoading(false)
		}
	}, [supabaseClient])

	const handleCreateChange = useCallback(e => {
		const value = e.target.value
		setText(value)
	}, [])

	const handleCreate = useCallback(async () => {
		console.log(`Creating`)
		try {
			let { status, error } = await supabaseClient.from('favorites').insert({
				event_id: text,
				user_id: user?.id,
			})
			console.log('insert', { status, error })
			setText('')
			loadData()
		} catch (e) {
			console.error(e)
		}
	}, [loadData, supabaseClient, text, user?.id])

	const handleDelete = useCallback(
		async id => {
			console.log(`Deleting ID: ${id}`)
			try {
				let { status, error } = await supabaseClient.from('favorites').delete().eq('id', id)
				console.log('delete', { status, error })
				loadData()
			} catch (e) {
				console.error(e)
			}
		},
		[loadData, supabaseClient]
	)

	const handleUpdate = useCallback(
		async (id, event_id) => {
			console.log(`Update ID: ${id}`)
			try {
				let { status, error } = await supabaseClient
					.from('favorites')
					.update({ created_at: new Date(), event_id: `${event_id}z` })
					.eq('id', id)
				console.log('delete', { status, error })
				loadData()
			} catch (e) {
				console.error(e)
			}
		},
		[loadData, supabaseClient]
	)

	useEffect(() => {
		console.log('init', user)
		// Only run query once user is logged in.
		// if (user)
		loadData()
	}, [loadData, supabaseClient, user])

	// if (!user)
	// 	return (
	// 		<Auth
	// 			redirectTo="http://localhost:3000/"
	// 			appearance={{ theme: ThemeSupa }}
	// 			supabaseClient={supabaseClient}
	// 			magicLink
	// 			view="magic_link"
	// 			showLinks={false}
	// 			// providers={[]}
	// 			// providers={['google', 'github']}
	// 			// socialLayout="horizontal"
	// 		/>
	// 	)

	return (
		<div>
			<h1>My Favorites</h1>
			{/* {loading ? (
				<div>Loading...</div>
			) : ( */}
			<ul>
				{favorites?.map(event => (
					<li key={event.id}>
						<div>{event.id}</div>
						<div>{event.event_id}</div>
						<div>{event.user_id}</div>
						<div>{event.created_at}</div>
						<button onClick={() => handleDelete(event.id)}>Delete</button>
						<button onClick={() => handleUpdate(event.id, event.event_id)}>Update</button>
						<hr />
					</li>
				))}
			</ul>
			{/* )} */}
			<hr />
			<h2>Create Favorite</h2>
			<input type="text" onChange={handleCreateChange} value={text} />
			<button onClick={handleCreate}>Create</button>
		</div>
	)
}

export default memo(Page)
