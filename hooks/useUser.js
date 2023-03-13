import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export const useUser = () => {
	// Supabase
	const supabaseClient = useSupabaseClient()

	const [isLoading, setIsLoading] = useState(true)
	const [session, setSession] = useState(null)

	useEffect(() => {
		let mounted = true
		async function getInitialSession() {
			const {
				data: { session },
			} = await supabaseClient.auth.getSession()
			// only update the react state if the component is still mounted
			if (mounted) {
				if (session) {
					setSession(session)
				}
				setIsLoading(false)
			}
		}
		getInitialSession()
		const { subscription } = supabaseClient.auth.onAuthStateChange((_event, session) => {
			setSession(session)
		})
		return () => {
			mounted = false
			subscription?.unsubscribe()
		}
	}, [supabaseClient.auth])

	useEffect(() => {
		console.log('session', session)
	}, [session])

	return {
		// user,
		session,
		isAuthed: !!session,
	}
}
