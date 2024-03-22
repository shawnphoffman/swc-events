import { styled } from 'linaria/react'

import Button from 'components/Button'
import { Input, InputWrapper } from 'components/styles'
import { useAuth } from 'hooks/useAuth'

const AccountWrapper = styled.div`
	width: 100%;
	max-width: 500px;
`

const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	max-width: 800px;
`
const Label = styled.div`
	font-weight: bold;
	margin: 16px 0px 8px 0px;
`

export default function Account() {
	const { client, user } = useAuth()

	return (
		<Wrapper>
			<AccountWrapper>
				<Label htmlFor="email">Email</Label>
				<InputWrapper>
					<Input id="email" type="text" value={user.email} disabled />
				</InputWrapper>
			</AccountWrapper>
			<Button onClick={() => client.auth.signOut()}>Sign Out</Button>
		</Wrapper>
	)
}
