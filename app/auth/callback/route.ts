import { type NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/server'

/** OAuth (PKCE) landing: trade the one-time code for a session cookie, then return the user where they started. */
export async function GET(request: NextRequest) {
	const { searchParams, origin } = request.nextUrl
	const code = searchParams.get('code')
	const nextParam = searchParams.get('next')
	const next = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/my-schedule'

	if (code) {
		const supabase = await createSupabaseServerClient()
		const { error } = await supabase.auth.exchangeCodeForSession(code)
		if (!error) return NextResponse.redirect(new URL(next, origin))
		console.error('[auth] code exchange failed', error.message)
	}
	const failure = new URL('/account', origin)
	failure.searchParams.set('error', searchParams.get('error_description') ?? 'Sign-in did not complete. Please try again.')
	return NextResponse.redirect(failure)
}
