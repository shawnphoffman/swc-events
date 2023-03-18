import { memo } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { styled } from 'linaria/react'

import UserEvents from 'components/auth/UserEvents'
import { Divider, PageTitle } from 'components/styles'
import Account from 'components/supabase/Account'
import { useAuth } from 'hooks/useAuth'

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
				<PageTitle>Sign in</PageTitle>
				<div>For additional functionality, sign in with a magic link sent to your email.</div>
				<Auth
					redirectTo={process.env.NODE_ENV === 'development' ? 'http://localhost:3000/' : 'https://swc.events'}
					appearance={{ theme: ThemeSupa, style: { container: { width: 500 } } }}
					supabaseClient={client}
					magicLink
					view="magic_link"
					showLinks={false}
					dark
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
