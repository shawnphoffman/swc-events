import 'styles/globals.css'

import { useEffect, useState } from 'react'
import { styled } from 'linaria/react'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import Head from 'next/head'

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

import EventProvider from 'context/EventContext'
import UserEventProvider from 'context/UserEventContext'
import PublicUserEventProvider from 'context/PublicUserEventContext'
import FavoritesProvider from 'context/FavoritesContext'
import Nav from 'components/Nav'

const Banner = styled.div`
	background-color: #b33a3a;
	width: 100%;
	padding: 16px;
	display: flex;
	justify-content: center;
	font-size: 18px;
	text-align: center;
	flex: 0 0 50px;
	align-items: center;
`

const AppWrapper = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100vh;
	height: ${p => (p.height ? `${p.height}px` : '100vh')};
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
	const [windowHeight, setWindowHeight] = useState()

	useEffect(() => {
		// console.log('window', window.innerHeight)
		setWindowHeight(window.innerHeight)
	}, [])

	return (
		<>
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>Celebration 2023 Companion</title>
				<meta name="description" content="A no-frills Celebration 2023 companion. Search and favorite panels, quick reference, and more!" />

				{/* <!-- Facebook Meta Tags --> */}
				<meta property="og:url" content="https://swc.events/" />
				<meta property="og:type" content="website" />
				<meta property="og:title" content="Celebration 2023 Companion" />
				<meta
					property="og:description"
					content="A no-frills Celebration 2023 companion. Search and favorite panels, quick reference, and more!"
				/>
				<meta property="og:image" content="https://swc.events/swc512.png" />
				<meta property="og:image:width" content="512" />
				<meta property="og:image:height" content="512" />

				{/* <!-- Twitter Meta Tags --> */}
				<meta name="twitter:card" content="summary" />
				<meta name="twitter:site" content="@iceplanethoff" />
				<meta property="twitter:domain" content="swc.events" />
				<meta property="twitter:url" content="https://swc.events/" />
				<meta name="twitter:title" content="Celebration 2023 Companion" />
				<meta
					name="twitter:description"
					content="A no-frills Celebration 2023 companion. Search and favorite panels, quick reference, and more!"
				/>
				<meta name="twitter:image" content="https://swc.events/swc512.png" />

				{/* <!-- Icons --> */}
				<link rel="apple-touch-icon" sizes="180x180" href="https://swc.events/icon-apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="256x256" href="https://swc.events/swc256.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="https://swc.events/swc32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="https://swc.events/swc16.png" />
				<link rel="icon" href="https://swc.events/ico.png" />
			</Head>
			<AppWrapper height={windowHeight}>
				<SessionContextProvider supabaseClient={supabaseClient} initialSession={pageProps.initialSession}>
					<UserEventProvider>
						<PublicUserEventProvider>
							<EventProvider>
								<FavoritesProvider>
									<Banner>This is site not 100% ready for Celebration 2023 (yet). It should be fully-functional soon.</Banner>
									<Nav />
									<Component {...pageProps} />
								</FavoritesProvider>
							</EventProvider>
						</PublicUserEventProvider>
					</UserEventProvider>
				</SessionContextProvider>
			</AppWrapper>
		</>
	)
}

export default MyApp
