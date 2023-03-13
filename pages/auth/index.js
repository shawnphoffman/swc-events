import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import Account from 'components/supabase/Account'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

export default function AuthIndex() {
	const supabaseClient = useSupabaseClient()
	const user = useUser()

	if (!user)
		return (
			<Auth
				redirectTo="http://localhost:3000/"
				appearance={{ theme: ThemeSupa }}
				supabaseClient={supabaseClient}
				magicLink
				view="magic_link"
				showLinks={false}
			/>
		)

	return (
		<div className="container" style={{ padding: '50px 0 100px 0' }}>
			<Account key={user.id} />
		</div>
	)
}
