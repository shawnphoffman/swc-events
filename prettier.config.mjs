import shared from '@shawnphoffman/prettier-config'

/** @type {import('prettier').Config} */
const config = {
	...shared,
	plugins: ['prettier-plugin-tailwindcss'],
	tailwindStylesheet: './app/globals.css',
	tailwindFunctions: ['cn', 'cva'],
}

export default config
