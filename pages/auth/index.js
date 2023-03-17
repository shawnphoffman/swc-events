import { memo } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
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
	const supabaseClient = useSupabaseClient()
	const user = useUser()

	if (!user)
		return (
			<Wrapper>
				<Auth
					redirectTo="http://localhost:3000/"
					appearance={{ theme: ThemeSupa }}
					supabaseClient={supabaseClient}
					magicLink
					view="magic_link"
					// showLinks={false}
					showLinks
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
