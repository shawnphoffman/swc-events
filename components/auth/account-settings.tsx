'use client'

import { useEffect, useState } from 'react'
import { ExternalLinkIcon, LogOutIcon, TriangleAlertIcon } from 'lucide-react'
import Link from 'next/link'
import { parseAsString, useQueryState } from 'nuqs'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { useFavorites, useVendorBookmarks } from '@/hooks/use-favorites'
import { useSession } from '@/hooks/use-session'
import { signOut } from '@/lib/auth'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

import { DeleteAccountCard } from './delete-account'
import { openSignIn } from './sign-in-dialog'

const HANDLE_PATTERN = /^[a-z0-9][a-z0-9-]{2,29}$/

type Profile = { display_name: string | null; handle: string | null; is_public: boolean }

export function AccountSettings() {
	const session = useSession()
	const [authError, setAuthError] = useQueryState('error', parseAsString)

	if (session.status === 'disabled') {
		return <p className="text-muted-foreground">Accounts aren&apos;t enabled on this deployment. Saved events stay on this device.</p>
	}
	if (session.status === 'loading') return <Skeleton className="h-64 w-full rounded-xl" />

	return (
		<div className="flex flex-col gap-4">
			{authError && (
				<Alert variant="destructive">
					<TriangleAlertIcon />
					<AlertTitle>Sign-in didn&apos;t finish</AlertTitle>
					<AlertDescription>{authError}</AlertDescription>
				</Alert>
			)}
			{session.status === 'signed-out' ? (
				<Card>
					<CardHeader>
						<CardTitle>Sync your schedule</CardTitle>
						<CardDescription>
							Sign in to keep saved events and bookmarks on every device. Anything you&apos;ve already saved here comes with you.
						</CardDescription>
					</CardHeader>
					<CardFooter>
						<Button
							onClick={() => {
								void setAuthError(null)
								openSignIn()
							}}
						>
							Sign in
						</Button>
					</CardFooter>
				</Card>
			) : (
				<SignedIn userId={session.user.id} email={session.user.email} />
			)}
		</div>
	)
}

function SignedIn({ userId, email }: { userId: string; email?: string }) {
	const favorites = useFavorites()
	const bookmarks = useVendorBookmarks()
	const [profile, setProfile] = useState<Profile | null>(null)
	const [draft, setDraft] = useState<Profile>({ display_name: '', handle: '', is_public: false })
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const supabase = getSupabaseBrowserClient()
		if (!supabase) return
		let cancelled = false
		supabase
			.from('profiles')
			.select('display_name, handle, is_public')
			.eq('id', userId)
			.single()
			.then(({ data, error }) => {
				if (cancelled) return
				if (error) {
					setError('Couldn’t load your profile.')
					return
				}
				setProfile(data)
				setDraft({ display_name: data.display_name ?? '', handle: data.handle ?? '', is_public: data.is_public })
			})
		return () => {
			cancelled = true
		}
	}, [userId])

	const handle = (draft.handle ?? '').trim().toLowerCase()
	const handleInvalid = handle.length > 0 && !HANDLE_PATTERN.test(handle)
	const publicNeedsHandle = draft.is_public && !handle

	const save = async (event: React.FormEvent) => {
		event.preventDefault()
		const supabase = getSupabaseBrowserClient()
		if (!supabase || handleInvalid || publicNeedsHandle) return
		setSaving(true)
		setError(null)
		const next = { display_name: draft.display_name?.trim() || null, handle: handle || null, is_public: draft.is_public }
		const { error } = await supabase.from('profiles').update(next).eq('id', userId)
		setSaving(false)
		if (error) {
			setError(error.code === '23505' ? 'That handle is taken. Try another.' : 'Couldn’t save. Please try again.')
			return
		}
		setProfile(next)
		toast.success('Profile saved')
	}

	if (!profile && !error) return <Skeleton className="h-64 w-full rounded-xl" />

	const dirty =
		profile &&
		((draft.display_name ?? '') !== (profile.display_name ?? '') || handle !== (profile.handle ?? '') || draft.is_public !== profile.is_public)

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Your account</CardTitle>
					<CardDescription>
						Signed in{email ? ` as ${email}` : ''}. {favorites.ids.length} saved events and {bookmarks.ids.length} vendor bookmarks sync to this account.
					</CardDescription>
				</CardHeader>
				<CardFooter>
					<Button
						variant="outline"
						onClick={async () => {
							await signOut()
							toast.success('Signed out')
						}}
					>
						<LogOutIcon data-icon="inline-start" />
						Sign out
					</Button>
				</CardFooter>
			</Card>

			<Card>
				<form onSubmit={save}>
					<CardHeader>
						<CardTitle>Public schedule</CardTitle>
						<CardDescription>Off by default. Turn it on to give friends a link to your schedule.</CardDescription>
					</CardHeader>
					<CardContent className="pt-4">
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="display-name">Display name</FieldLabel>
								<Input
									id="display-name"
									maxLength={60}
									value={draft.display_name ?? ''}
									onChange={e => setDraft(d => ({ ...d, display_name: e.target.value }))}
								/>
							</Field>
							<Field data-invalid={handleInvalid || undefined}>
								<FieldLabel htmlFor="handle">Handle</FieldLabel>
								<Input
									id="handle"
									autoCapitalize="none"
									autoCorrect="off"
									spellCheck={false}
									placeholder="e.g. tk-421"
									value={draft.handle ?? ''}
									onChange={e => setDraft(d => ({ ...d, handle: e.target.value.toLowerCase() }))}
									aria-invalid={handleInvalid || undefined}
								/>
								<FieldDescription>3 to 30 lowercase letters, numbers, or dashes. Your page would be swc.events/u/{handle || 'handle'}.</FieldDescription>
								{handleInvalid && <FieldError>Use lowercase letters, numbers, and dashes only.</FieldError>}
							</Field>
							<Field orientation="horizontal" data-invalid={publicNeedsHandle || undefined}>
								<FieldContent>
									<FieldLabel htmlFor="is-public">Make my schedule public</FieldLabel>
									<FieldDescription>Anyone with the link can see your saved events. Vendor bookmarks stay private.</FieldDescription>
									{publicNeedsHandle && <FieldError>Pick a handle first.</FieldError>}
								</FieldContent>
								<Switch id="is-public" checked={draft.is_public} onCheckedChange={is_public => setDraft(d => ({ ...d, is_public }))} />
							</Field>
							{error && <FieldError>{error}</FieldError>}
						</FieldGroup>
					</CardContent>
					<CardFooter className="flex flex-wrap gap-2 pt-4">
						<Button type="submit" disabled={!dirty || saving || handleInvalid || publicNeedsHandle}>
							{saving ? 'Saving…' : 'Save'}
						</Button>
						{profile?.is_public && profile.handle && (
							<Button asChild variant="link">
								<Link href={`/u/${profile.handle}`}>
									View public page
									<ExternalLinkIcon data-icon="inline-end" />
								</Link>
							</Button>
						)}
					</CardFooter>
				</form>
			</Card>

			<DeleteAccountCard />
		</>
	)
}
