'use client'

import { useSyncExternalStore } from 'react'
import type { User } from '@supabase/supabase-js'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'

export type SessionState =
	| { status: 'disabled'; user: null }
	| { status: 'loading'; user: null }
	| { status: 'signed-out'; user: null }
	| { status: 'signed-in'; user: User }

const DISABLED: SessionState = { status: 'disabled', user: null }
const LOADING: SessionState = { status: 'loading', user: null }
const SIGNED_OUT: SessionState = { status: 'signed-out', user: null }

let state: SessionState = isSupabaseConfigured ? LOADING : DISABLED
let started = false
const listeners = new Set<() => void>()

function start() {
	if (started) return
	started = true
	const supabase = getSupabaseBrowserClient()
	if (!supabase) return
	// INITIAL_SESSION fires once with the stored session (or null), then on every change.
	supabase.auth.onAuthStateChange((_event, session) => {
		const next: SessionState = session?.user ? { status: 'signed-in', user: session.user } : SIGNED_OUT
		if (next.status === state.status && next.user?.id === state.user?.id) return
		state = next
		listeners.forEach(l => l())
	})
}

function subscribe(listener: () => void) {
	start()
	listeners.add(listener)
	return () => listeners.delete(listener)
}

export const getSessionState = () => state
export const subscribeSession = subscribe

const getServerSnapshot = () => (isSupabaseConfigured ? LOADING : DISABLED)

export function useSession(): SessionState {
	return useSyncExternalStore(subscribe, getSessionState, getServerSnapshot)
}
