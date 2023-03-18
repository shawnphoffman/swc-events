import { memo } from 'react'
import { useAuth } from 'hooks/useAuth'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { styled } from 'linaria/react'

import { Divider } from 'components/styles'
import Account from 'components/supabase/Account'
import UserEvents from 'components/auth/UserEvents'

const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
`

const AuthIndex = () => {
	const { client, user } = useAuth()

	if (!user)
		return (
			<Wrapper>
				<Auth
					redirectTo={process.env.NODE_ENV === 'development' ? 'http://localhost:3000/' : 'https://swc.events'}
					appearance={{ theme: ThemeSupa }}
					supabaseClient={client}
					magicLink
					view="magic_link"
					showLinks={false}
				/>
			</Wrapper>
		)

	return (
		<Wrapper>
			<Account />
			<Divider />
			<UserEvents user={user} />
		</Wrapper>
	)
}

export default memo(AuthIndex)
