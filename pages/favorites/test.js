import { useAuth } from 'hooks/useAuth'
import { memo, useCallback, useEffect, useState } from 'react'

const MyFavorites = () => {
	const { client, user } = useAuth()

	const [loading, setLoading] = useState(true)
	const [favorites, setFavorites] = useState([])
	const [text, setText] = useState('')

	const loadData = useCallback(async () => {
		try {
			setLoading(true)

			let { data, status, error } = await client.from('favorites').select().eq('user_id', user.id)

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
			}
		} catch (error) {
			console.log('load', error)
			alert(error.message)
		} finally {
			setLoading(false)
		}
	}, [client, user])

	const handleCreateChange = useCallback(e => {
		const value = e.target.value
		setText(value)
	}, [])

	const handleCreate = useCallback(async () => {
		console.log(`Creating`)
		try {
			let { status, error } = await client.from('favorites').insert({
				event_id: text,
				user_id: user?.id,
			})
			console.log('insert', { status, error })
			setText('')
			loadData()
		} catch (e) {
			console.error('create', e)
		}
	}, [loadData, client, text, user?.id])

	const handleDelete = useCallback(
		async id => {
			console.log(`Deleting ID: ${id}`)
			try {
				let { status, error } = await client.from('favorites').delete().eq('id', id)
				console.log('delete', { status, error })
				loadData()
			} catch (e) {
				console.error('delete', e)
			}
		},
		[loadData, client]
	)

	const handleUpdate = useCallback(
		async (id, event_id) => {
			console.log(`Update ID: ${id}`)
			try {
				let { status, error } = await client
					.from('favorites')
					.update({ created_at: new Date(), event_id: `${event_id}z` })
					.eq('id', id)
				console.log('update', { status, error })
				loadData()
			} catch (e) {
				console.error('update', e)
			}
		},
		[loadData, client]
	)

	useEffect(() => {
		if (user) {
			console.log('init', user)
			loadData()
		}
	}, [loadData, user])

	return (
		<div className="page">
			<h1>My Favorites</h1>
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
			<hr />
			<h2>Create Favorite</h2>
			<input type="text" onChange={handleCreateChange} value={text} />
			<button onClick={handleCreate}>Create</button>
		</div>
	)
}

export default memo(MyFavorites)
