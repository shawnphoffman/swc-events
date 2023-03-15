const withLinaria = require('next-linaria')

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	webpack(config) {
		config.module.rules.push({
			test: /\.svg$/i,
			issuer: /\.[jt]sx?$/,
			use: ['@svgr/webpack'],
		})
		return config
	},
	async redirects() {
		return [
			{
				source: '/',
				destination: '/schedule',
				permanent: false,
			},
		]
	},
}

module.exports = withLinaria(nextConfig)
