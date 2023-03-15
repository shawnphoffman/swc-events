import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import Account from 'components/supabase/Account'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { styled } from 'linaria/react'

const Wrapper = styled.div`
	max-width: 300px;
	width: 100%;
`

export default function AuthIndex() {
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
		</Wrapper>
	)
}
