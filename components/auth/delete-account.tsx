'use client'

import { useState, useTransition } from 'react'
import { Trash2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { deleteAccount } from '@/app/account/actions'
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { allStores } from '@/lib/sync/stores'

const CONFIRM_WORD = 'delete'

export function DeleteAccountCard() {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [typed, setTyped] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [pending, startTransition] = useTransition()

	const confirm = () =>
		startTransition(async () => {
			setError(null)
			const result = await deleteAccount()
			if (!result.ok) {
				setError(result.error)
				return
			}
			allStores.forEach(s => s.resetLocal())
			await getSupabaseBrowserClient()?.auth.signOut({ scope: 'local' })
			setOpen(false)
			toast.success('Your account and saved data were deleted.')
			router.replace('/')
		})

	return (
		<Card className="border-destructive/40">
			<CardHeader>
				<CardTitle>Delete account</CardTitle>
				<CardDescription>Permanently removes your account, profile, saved events and vendor bookmarks. This can&apos;t be undone.</CardDescription>
			</CardHeader>
			<CardFooter>
				<AlertDialog
					open={open}
					onOpenChange={next => {
						setOpen(next)
						if (!next) {
							setTyped('')
							setError(null)
						}
					}}
				>
					<AlertDialogTrigger asChild>
						<Button variant="destructive">
							<Trash2Icon data-icon="inline-start" />
							Delete account
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete your account?</AlertDialogTitle>
							<AlertDialogDescription>
								Everything synced to this account is erased immediately, including your public schedule page.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<Field data-invalid={!!error || undefined}>
							<FieldLabel htmlFor="confirm-delete">Type &ldquo;{CONFIRM_WORD}&rdquo; to confirm</FieldLabel>
							<Input
								id="confirm-delete"
								autoComplete="off"
								autoCapitalize="none"
								value={typed}
								onChange={e => setTyped(e.target.value)}
								aria-invalid={!!error || undefined}
							/>
							{error ? <FieldError>{error}</FieldError> : <FieldDescription>Signed out on every device.</FieldDescription>}
						</Field>
						<AlertDialogFooter>
							<AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
							{/* Plain button, not AlertDialogAction, so the dialog stays open to show errors. */}
							<Button variant="destructive" disabled={pending || typed.trim().toLowerCase() !== CONFIRM_WORD} onClick={confirm}>
								{pending ? 'Deleting…' : 'Delete forever'}
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</CardFooter>
		</Card>
	)
}
