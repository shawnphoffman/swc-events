import 'styles/globals.css'

import EventProvider from 'context/EventContext'
import Nav from 'components/Nav'

function MyApp({ Component, pageProps }) {
	// console.log('MyApp.init', {
	// 	Component,
	// 	pageProps,
	// })
	return (
		// <div id="root">
		<EventProvider>
			<Nav />
			<Component {...pageProps} />
		</EventProvider>
		// </div>
	)
}

export default MyApp
