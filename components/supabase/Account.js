import { useState, useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import Avatar from './Avatar'

export default function Account() {
	const [loading, setLoading] = useState(true)
	const [username, setUsername] = useState(null)
	const [website, setWebsite] = useState(null)
	const [avatar_url, setAvatarUrl] = useState(null)
	const supabaseClient = useSupabaseClient()
	const user = useUser()

	useEffect(() => {
		async function getProfile() {
			try {
				setLoading(true)
				// const user = await getCurrentUser()

				let { data, error, status } = await supabaseClient
					.from('profiles')
					.select(`username, website, avatar_url`)
					.eq('id', user.id)
					.single()

				if (error && status !== 406) {
					throw error
				}

				if (data) {
					setUsername(data.username)
					setWebsite(data.website)
					setAvatarUrl(data.avatar_url)
				}
			} catch (error) {
				alert(error.message)
			} finally {
				setLoading(false)
			}
		}
		getProfile()
	}, [supabaseClient, user?.id])

	async function updateProfile({ username, website, avatar_url }) {
		try {
			setLoading(true)
			const user = await getCurrentUser()

			const updates = {
				id: user.id,
				username,
				website,
				avatar_url,
				updated_at: new Date(),
			}

			let { error } = await supabaseClient.from('profiles').upsert(updates)

			if (error) {
				throw error
			}
		} catch (error) {
			alert(error.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="form-widget">
			{/* Add to the body */}
			<Avatar
				url={avatar_url}
				size={150}
				onUpload={url => {
					setAvatarUrl(url)
					updateProfile({ username, website, avatar_url: url })
				}}
			/>
			<div>
				<label htmlFor="email">Email</label>
				<input id="email" type="text" value={user.email} disabled />
			</div>
			<div>
				<label htmlFor="username">Name</label>
				<input id="username" type="text" value={username || ''} onChange={e => setUsername(e.target.value)} />
			</div>
			<div>
				<label htmlFor="website">Website</label>
				<input id="website" type="website" value={website || ''} onChange={e => setWebsite(e.target.value)} />
			</div>

			<div>
				<button className="button primary block" onClick={() => updateProfile({ username, website, avatar_url })} disabled={loading}>
					{loading ? 'Loading ...' : 'Update'}
				</button>
			</div>

			<div>
				<button className="button block" onClick={() => supabaseClient.auth.signOut()}>
					Sign Out
				</button>
			</div>
		</div>
	)
}
