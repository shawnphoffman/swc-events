import 'styles/globals.css'

import { useState } from 'react'
import { styled } from 'linaria/react'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

import { library } from '@fortawesome/fontawesome-svg-core'
import {
	faCalendarLines,
	faMessagesQuestion,
	faMagnifyingGlass,
	faHeart,
	faPrint,
	faUser,
	faRightFromBracket,
	faUserBountyHunter,
	faFlaskVial,
	faCashRegister,
	faStore,
	faPaintBrushFine,
	faMap,
} from '@fortawesome/sharp-solid-svg-icons'

library.add(
	faCalendarLines,
	faMessagesQuestion,
	faMagnifyingGlass,
	faHeart,
	faPrint,
	faUser,
	faRightFromBracket,
	faUserBountyHunter,
	faFlaskVial,
	faCashRegister,
	faStore,
	faPaintBrushFine,
	faMap
)

console.log({ config })

import EventProvider from 'context/EventContext'
import FavoritesProvider from 'context/FavoritesContext'
import Nav from 'components/Nav'

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
