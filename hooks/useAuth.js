import { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'

export const useAuth = () => {
	// Supabase
	const client = useSupabaseClient()
	const user = useUser()

	const [isLoading, setIsLoading] = useState(true)
	const [session, setSession] = useState(null)

	useEffect(() => {
		let mounted = true
		async function getInitialSession() {
			const {
				data: { session },
			} = await client.auth.getSession()
			// only update the react state if the component is still mounted
			if (mounted) {
				if (session) {
					setSession(session)
				}
				setIsLoading(false)
			}
		}
		getInitialSession()
		const { subscription } = client.auth.onAuthStateChange((_event, session) => {
			setSession(session)
		})
		return () => {
			mounted = false
			subscription?.unsubscribe()
		}
	}, [client.auth])

	useEffect(() => {
		// console.log('useAuth.session', session)
	}, [session])

	useEffect(() => {
		// console.log('useAuth.user', user)
	}, [user])

	return {
		client,
		user,
		session,
		isAuthed: !!session,
	}
}
