import 'styles/globals.css'

import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'

import EventProvider from 'context/EventContext'
import FavoritesProvider from 'context/FavoritesContext'
import Nav from 'components/Nav'

function MyApp({ Component, pageProps }) {
	const [supabaseClient] = useState(() => createBrowserSupabaseClient())

	return (
		<SessionContextProvider supabaseClient={supabaseClient} initialSession={pageProps.initialSession}>
			<EventProvider>
				<FavoritesProvider>
					<Nav />
					<Component {...pageProps} />
				</FavoritesProvider>
			</EventProvider>
		</SessionContextProvider>
	)
}

export default MyApp
