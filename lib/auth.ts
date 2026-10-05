'use client'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { allStores } from '@/lib/sync/stores'

export type OAuthProvider = 'google' | 'discord'

/** Only allow same-site relative paths as post-sign-in destinations. */
export function safeNextPath(next: string | null | undefined): string {
	return next && next.startsWith('/') && !next.startsWith('//') ? next : '/my-schedule'
}

export async function signInWithProvider(provider: OAuthProvider, next: string) {
	const supabase = getSupabaseBrowserClient()
	if (!supabase) throw new Error('Accounts are not configured')
	const redirectTo = new URL('/auth/callback', window.location.origin)
	redirectTo.searchParams.set('next', safeNextPath(next))
	const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: redirectTo.toString() } })
	if (error) throw error
}

/** Sends a 6-digit code (the email template uses {{ .Token }}, not a link). */
export async function sendEmailCode(email: string) {
	const supabase = getSupabaseBrowserClient()
	if (!supabase) throw new Error('Accounts are not configured')
	const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
	if (error) throw error
}

export async function verifyEmailCode(email: string, token: string) {
	const supabase = getSupabaseBrowserClient()
	if (!supabase) throw new Error('Accounts are not configured')
	const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
	if (error) throw error
}

/** Saved items are safe in the account, so an explicit sign-out leaves nothing on the device. */
export async function signOut() {
	const supabase = getSupabaseBrowserClient()
	allStores.forEach(s => s.resetLocal())
	await supabase?.auth.signOut()
}
