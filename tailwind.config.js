/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		//
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			screens: {
				xs: '480px',
			},
		},
	},
	plugins: [
		//
		require('@tailwindcss/forms'),
		require('@tailwindcss/container-queries'),
		require('daisyui'),
	],
	daisyui: {
		themes: ['light', 'night', 'dark'],
	},
}
