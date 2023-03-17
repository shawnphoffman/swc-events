import { useState, useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { styled } from 'linaria/react'

import Button from 'components/Button'
import { Input, InputWrapper, PageTitle } from 'components/styles'

const Wrapper = styled.div`
	max-width: 300px;
	width: 100%;
`
const Label = styled.div`
	font-weight: bold;
	margin: 16px 0px 8px 0px;
`
const InputContainer = styled.div``

export default function Account() {
	// const [loading, setLoading] = useState(true)
	// const [username, setUsername] = useState(null)
	const supabaseClient = useSupabaseClient()
	const user = useUser()

	// useEffect(() => {
	// 	async function getProfile() {
	// 		try {
	// 			setLoading(true)

	// 			let { data, error, status } = await supabaseClient.from('profiles').select(`username`).eq('id', user.id).single()

	// 			if (error && status !== 406) {
	// 				throw error
	// 			}

	// 			if (data) {
	// 				setUsername(data.username)
	// 			}
	// 		} catch (error) {
	// 			alert(error.message)
	// 		} finally {
	// 			setLoading(false)
	// 		}
	// 	}
	// 	getProfile()
	// }, [supabaseClient, user?.id])

	// async function updateProfile({ username }) {
	// 	try {
	// 		setLoading(true)

	// 		const updates = {
	// 			id: user.id,
	// 			username,
	// 			updated_at: new Date(),
	// 		}

	// 		let { error } = await supabaseClient.from('profiles').upsert(updates)

	// 		if (error) {
	// 			throw error
	// 		}
	// 	} catch (error) {
	// 		alert(error.message)
	// 	} finally {
	// 		setLoading(false)
	// 	}
	// }

	return (
		<Wrapper>
			<PageTitle>User Info</PageTitle>

			<InputContainer>
				<Label htmlFor="email">Email</Label>
				<InputWrapper>
					<Input id="email" type="text" value={user.email} disabled />
				</InputWrapper>
			</InputContainer>

			{/* <InputContainer>
				<Label htmlFor="username">Name</Label>
				<InputWrapper>
					<Input id="username" type="text" value={username || ''} onChange={e => setUsername(e.target.value)} />
				</InputWrapper>
			</InputContainer> */}

			<div>
				{/* <Button onClick={() => updateProfile({ username })} disabled={loading}>
					{loading ? 'Loading ...' : 'Update'}
				</Button> */}

				<Button onClick={() => supabaseClient.auth.signOut()}>Sign Out</Button>
			</div>
		</Wrapper>
	)
}
