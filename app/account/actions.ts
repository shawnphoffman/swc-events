'use server'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type DeleteAccountResult = { ok: true } | { ok: false; error: string }

/**
 * Permanently deletes the signed-in user. The user id comes from the verified
 * session cookie, never from the client. Profile, saved events and bookmarks
 * are removed by ON DELETE CASCADE.
 */
export async function deleteAccount(): Promise<DeleteAccountResult> {
	const supabase = await createSupabaseServerClient()
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser()
	if (userError || !user) return { ok: false, error: 'Your session expired. Sign in again, then retry.' }

	const admin = createSupabaseAdminClient()
	if (!admin) return { ok: false, error: 'Account deletion isn’t available right now. Please try again later.' }

	const { error } = await admin.auth.admin.deleteUser(user.id)
	if (error) {
		console.error('[account] delete failed', error.message)
		return { ok: false, error: 'Couldn’t delete your account. Please try again.' }
	}

	// Clear the session cookies; the user no longer exists, so skip the server round trip.
	await supabase.auth.signOut({ scope: 'local' })
	return { ok: true }
}
