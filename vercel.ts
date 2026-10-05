import type { VercelConfig } from '@vercel/config/v1'

export const config: VercelConfig = {
	framework: 'nextjs',
	crons: [
		// Keeps the free-tier Supabase project from pausing. Daily is well inside the 7-day limit.
		{ path: '/api/cron/keep-alive', schedule: '17 15 * * *' },
	],
}
