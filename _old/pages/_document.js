import { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				{/* Normalize */}
				<Script src="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css" defer />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	)
}
