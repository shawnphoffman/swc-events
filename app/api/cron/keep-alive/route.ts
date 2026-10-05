import { connection } from 'next/server'

import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabasePublicClient } from '@/lib/supabase/server'

/**
 * Daily ping so the free-tier Supabase project never pauses (it pauses after 7
 * idle days, and a paused project fails sign-in and sync until restored by hand).
 * Scheduled in vercel.ts. Vercel sends `Authorization: Bearer $CRON_SECRET` when set.
 */
export async function GET(request: Request) {
	// Must hit the database on every invocation; never prerender.
	await connection()
	const secret = process.env.CRON_SECRET
	if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
		return new Response('Unauthorized', { status: 401 })
	}
	if (!isSupabaseConfigured) return Response.json({ ok: false, reason: 'supabase not configured' }, { status: 503 })

	const { data, error } = await createSupabasePublicClient().rpc('ping')
	if (error) {
		console.error('[keep-alive] ping failed', error.message)
		return Response.json({ ok: false }, { status: 502 })
	}
	return Response.json({ ok: true, at: data })
}
