import 'styles/globals.css'

import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'

import EventProvider from 'context/EventContext'
import FavoritesProvider from 'context/FavoritesContext'
import Nav from 'components/Nav'
import { styled } from 'linaria/react'

// height: ${() => window.innerHeight}px;
const AppWrapper = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100vh;
	align-items: center;
	padding: 0 8px 8px 8px;
	background: var(--bg);

	@media print {
		background: none;
		color: black;
		padding: 0;
		height: auto;
		position: relative;
		display: block;
	}
`

function MyApp({ Component, pageProps }) {
	const [supabaseClient] = useState(() => createBrowserSupabaseClient())

	return (
		<AppWrapper>
			<SessionContextProvider supabaseClient={supabaseClient} initialSession={pageProps.initialSession}>
				<EventProvider>
					<FavoritesProvider>
						<Nav />
						<Component {...pageProps} />
					</FavoritesProvider>
				</EventProvider>
			</SessionContextProvider>
		</AppWrapper>
	)
}

export default MyApp
