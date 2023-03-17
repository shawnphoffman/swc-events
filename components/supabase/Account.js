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
const StyledInput = styled(Input)`
	padding: 12px;
`

export default function Account() {
	const supabaseClient = useSupabaseClient()
	const user = useUser()

	return (
		<Wrapper>
			<PageTitle>User Info</PageTitle>

			<InputContainer>
				<Label htmlFor="email">Email</Label>
				<InputWrapper>
					<StyledInput id="email" type="text" value={user.email} disabled />
				</InputWrapper>
			</InputContainer>

			<Button onClick={() => supabaseClient.auth.signOut()}>Sign Out</Button>
		</Wrapper>
	)
}
