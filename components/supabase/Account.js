import { useState, useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { styled } from 'linaria/react'

import Avatar from './Avatar'
import Button from 'components/Button'
import { Input, InputWrapper } from 'components/styles'

const Wrapper = styled.div``
const Label = styled.div``
const InputContainer = styled.div``

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
		<Wrapper>
			{/* Add to the body */}
			<Avatar
				url={avatar_url}
				size={150}
				onUpload={url => {
					setAvatarUrl(url)
					updateProfile({ username, website, avatar_url: url })
				}}
			/>
			<InputContainer>
				<Label htmlFor="email">Email</Label>
				<InputWrapper>
					<Input id="email" type="text" value={user.email} disabled />
				</InputWrapper>
			</InputContainer>

			<InputContainer>
				<Label htmlFor="username">Name</Label>
				<InputWrapper>
					<Input id="username" type="text" value={username || ''} onChange={e => setUsername(e.target.value)} />
				</InputWrapper>
			</InputContainer>

			<InputContainer>
				<Label htmlFor="website">Website</Label>
				<InputWrapper>
					<Input id="website" type="website" value={website || ''} onChange={e => setWebsite(e.target.value)} />
				</InputWrapper>
			</InputContainer>

			<Button onClick={() => updateProfile({ username, website, avatar_url })} disabled={loading}>
				{loading ? 'Loading ...' : 'Update'}
			</Button>

			<Button onClick={() => supabaseClient.auth.signOut()}>Sign Out</Button>
		</Wrapper>
	)
}
