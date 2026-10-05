/** @type {import('prettier').Config} */
const config = {
	printWidth: 140,
	useTabs: true,
	semi: false,
	arrowParens: 'avoid',
	trailingComma: 'es5',
	singleQuote: true,
	plugins: ['prettier-plugin-tailwindcss'],
	tailwindStylesheet: './app/globals.css',
	tailwindFunctions: ['cn', 'cva'],
}

export default config
